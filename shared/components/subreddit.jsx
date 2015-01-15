var Fluxxor = require("fluxxor"),
    React = require("react"),
    Router = require("react-router");

var SubredditStore = require("../stores/subreddit_store.jsx");

module.exports = React.createClass({
  displayName: "Subreddit",

  mixins: [
    Fluxxor.FluxMixin(React),
    Fluxxor.StoreWatchMixin("subreddit"),
    Router.State
  ],

  getInitialState() {
    var params = this.getParams(),
        subreddit = params.subreddit;

    return {
      name: subreddit
    };
  },

  getStateFromFlux() {
    var params = this.getParams(),
        flux = this.getFlux(),
        subreddit = params.subreddit,
        subredditStore = flux.store("subreddit");

    return {
      // This method is synchronous, even though it may kick off
      // an asynchronous process. However, the results of the
      // async process are handled solely by the flux system.
      subredditData: subredditStore.getSubreddit(subreddit)
    };
  },

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

  renderLoadingMessage() {
    return <div>Loading...</div>;
  },

  renderSubredditData() {
    var data = this.state.subredditData,
        children = data.data.children;

    return <ul>{children.map(this.renderPostLink)}</ul>;
  },

  renderPostLink(post) {
    return <li key={post.data.id}>{post.data.title}</li>;
  }
});
