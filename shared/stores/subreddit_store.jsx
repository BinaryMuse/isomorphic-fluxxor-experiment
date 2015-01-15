var Fluxxor = require("fluxxor");

var LOADING_TOKEN = {};

var SubredditStore = Fluxxor.createStore({
  actions: {
    "SUBREDDIT_FETCH_SUCCESS": "handleSubredditFetchSuccess"
  },

  initialize(reddit) {
    this.reddit = reddit;

    this.state = {
      subreddits: {}
    };
  },

  getSubreddit(subreddit) {
    if (this.state.subreddits[subreddit]) {
      // If data is cached, return it immediately...
      return this.state.subreddits[subreddit];
    } else {
      // ...otherwise, set (and return) a loading token and
      // fetch the data asynchronously.
      this.state.subreddits[subreddit] = LOADING_TOKEN;
      this.reddit.getSubreddit(subreddit, (err, data) => {
        // The golden rule of flux: the result of async functions
        // should fire an action as a result (e.g. they should
        // NOT modify the store directly).
        this.flux.actions.subredditFetchSuccess(subreddit, data);
      });
      return LOADING_TOKEN;
    }
  },

  handleSubredditFetchSuccess({subreddit, data}) {
    this.state.subreddits[subreddit] = data;
    this.emit("change");
  },

  serialize() {
    return JSON.stringify(this.state);
  },

  hydrate(json) {
    this.state = JSON.parse(json);
  }
});

SubredditStore.LOADING_TOKEN = LOADING_TOKEN;

module.exports = SubredditStore;
