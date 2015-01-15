Isomorphic Fluxxor
==================

This is an application designed to test rendering an isomorphic React app powered by [Fluxxor](http://fluxxor.com/). It fetches some basic information from Reddit.

Running
-------

Requires Node.js installed.

```
$ npm install
$ npm start
```

You can set a different port with the `PORT` environment variable.

Overview
--------

Here's how it works from a high level.

> Note: As a proof-of-concept, this app cuts some corners, skips some error checking, and short-circuits some best practices. Consult the docs for [React](http://facebook.github.io/react/), [react-router](https://github.com/rackt/react-router), and [Fluxxor](http://fluxxor.com/) for more information on the proper use of each.

1. Components don't fetch data by dispatching actions; instead, they ask for it directly from the appropriate store using a getter on that store.

    ```javascript
    getStateFromFlux() {
      return {
        subredditData: subredditStore.getSubreddit(subreddit)
      };
    },
    ```

2. If the store has the data cached, it returns it immediately. Otherwise, it returns a "loading token" and starts an async fetch for the data.

    ```javascript
    getSubreddit(subreddit) {
      if (this.state.subreddits[subreddit]) {
        return this.state.subreddits[subreddit];
      } else {
        this.state.subreddits[subreddit] = LOADING_TOKEN;
        this.reddit.getSubreddit(subreddit, (err, data) => {
          // ...
        });
        return LOADING_TOKEN;
      }
    },
    ```

3. When the async fetch is complete, the store dispatches a "success" action to inform the system that the data is ready. It uses this action to update itself.

    ```javascript
    getSubreddit(subreddit) {
      // ...

        this.reddit.getSubreddit(subreddit, (err, data) => {
          if (err) dispatch(FETCH_FAILURE, {subreddit: subreddit, err: err});
          else     dispatch(FETCH_SUCCESS, {subreddit: subreddit, data: data});
        });

      // ...
    },

    handleFetchSuccess(payload) {
      this.state.subreddits[payload.subreddit] = payload.data;
      this.emit("change");
    }
    ```

4. The component that originally requested the data uses the loading token to determine if the data is ready or not.

    ```javascript```
    render() {
      return (
        <div>
          <h2>/r/{this.state.name}</h2>
          {
            this.state.subredditData === SubredditStore.LOADING_TOKEN ?
            this.renderLoadingMessage() :
            this.renderSubredditData()
          }
        </div>
      );
    },
    ```

5. On the server, we inject a server-side version of the Reddit API into our store.

    ```javascript
    var reddit = new Reddit(ServerRedditFetcher);
    var flux = Flux(reddit);
    ```

    This object emits events whenever it starts to fetch or finishes fetching a request from the Reddit API. We can use this information to know when we're done loading data asynchronously (because the the number of requests started minus the number of requests finished will be zero).

    ```javascript
    reddit.on("reqs", (num) => {
      if (num === 0) {
        reddit.removeAllListeners();
        render();
      }
    });
    ```

6. We do an *initial* server-side render to kick off the `getInitialState` calls, which start the async data requests flowing. Note that we don't do anything with the return value; we're only interested in the side effects that rendering the app has on our stores.

    ```javascript
    Router.run(Routes, req.url, (Handler, state) => {
      React.renderToString(
        <Handler key={state.path} flux={flux} />
      );
    });
    ```

7. Once the Reddit API finishes the last request, we call `render()` (see above); here, we render the app *again*, and this time we send the React HTML and the serialized Fluxxor store data to the client.

    ```javascript
    var render = () => {
      var serializedFlux = flux.serialize();
      Router.run(Routes, req.url, (Handler, state) => {
        var content = React.renderToString(
          <Handler key={state.path} flux={flux} />
        );

        res.render("index", {
          reactMarkup: content,
          serializedFlux: serializedFlux
        });
      });
    };
    ```

8. Our server-side view injects the HTML and serialized data into the page.

    ```ejs
    <script>
    window.fluxData = <%- serializedFlux %>;
    </script>
    <div id="app-container"><%- reactMarkup %></div>
    ```

9. When the client-side application boots, we use the serialized store data to reconstruct the state from the server. We also use a different version of the Reddit API that works on the client.

    ```javascript
    var reddit = new Reddit(ClientRedditFetcher);

    var flux = Flux(reddit);
    if (window.fluxData) {
      flux.hydrate(window.fluxData);
    }

    Router.run(Routes, Router.HistoryLocation, (Handler, state) => {
      React.render(
        <Handler key={state.path} flux={flux} />,
        document.getElementById("app-container")
      );
    });
    ```

10. Since the flux state is the same on the client as it was on the server, React transparently "upgrades" our static markup into a proper single-page app. Any future asynchronous fetches are handled the same way they were on the server--by calling the getter on the store, which triggers an async fetch and an action as a result.

Considerations
--------------

This seems to work well, and I like the declarative approach to getting appropriate component state from the stores. I haven't investigated the performance characteristics of rendering twice on the server. Additional care needs to be taken to ensure we don't leak if something goes wrong.

One situation where this naive approach will not work is when the availability of asynchronous data causes the second server-side render to include new components not included in the first render, and these new components also request async data from the stores. In such a case, you would need to repeat the loop that checks for outstanding requests until there are no more. An alternative approach, which I think I like, is to limit the fetching of async data to components that will be used by react-router as route handlers (thus ensuring they are triggered on the first server-side render).
