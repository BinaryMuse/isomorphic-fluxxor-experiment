var serveStatic = require("serve-static"),
    webpack = require("webpack"),
    webpackDevMiddleware = require("webpack-dev-middleware"),
    webpackConfig = require("../webpack.config.js"),
    React = require("react"),
    Router = require("react-router");

var Reddit = require("../shared/reddit.jsx"),
    ServerRedditFetcher = require("./reddit_fetcher.jsx"),
    Routes = require("../shared/routes.jsx"),
    Flux = require("../shared/flux.jsx");

module.exports = (app) => {
  app.set("view engine", "ejs");
  app.use(serveStatic("./public"));

  app.use(webpackDevMiddleware(webpack(webpackConfig), {
    noInfo: true,
    publicPath: "/js/"
  }));

  // Every non-static-asset request uses the same code path.
  app.use(function(req, res) {
    var reddit = new Reddit(ServerRedditFetcher);
    var flux = Flux(reddit);

    // This method will actually render the application, sending the
    // static markup and the serialized flux stores to the client.
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

    // We will render immediately unless this timer is
    // cancelled, below.
    var timer = setImmediate(() => {
      render();
    });

    // If we make *any* requests to the Reddit API, cancel the
    // "render immediately" timer and check to see if the Reddit
    // module is done with all its requests. If it is, we have
    // all the async data we need and we can render.
    //
    // If the reddit API is never called, we will never get
    // a `reqs` even, and the `setImmediate` call, above, will
    // cause the app to re-render right away.
    reddit.on("reqs", (num) => {
      timer && clearImmediate(timer);
      timer = null;
      if (num === 0) {
        reddit.removeAllListeners();
        render();
      }
    });

    // We will render the application once just to kick off all
    // the `getInitialState` calls; we don't care about the
    // return value, because we will render again once all the
    // async data is available.
    Router.run(Routes, req.url, (Handler, state) => {
      React.renderToString(
        <Handler key={state.path} flux={flux} />
      );
    });
  });
};
