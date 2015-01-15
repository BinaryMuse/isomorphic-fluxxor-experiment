var Fluxxor = require("fluxxor");

var SubredditStore = require("./stores/subreddit_store.jsx");

module.exports = (reddit) => {
  var stores = {
    subreddit: new SubredditStore(reddit)
  };

  var actions = {
    subredditFetchSuccess(subreddit, data) {
      this.dispatch("SUBREDDIT_FETCH_SUCCESS", {subreddit, data});
    }
  };

  var flux = new Fluxxor.Flux(stores, actions);

  // Add our own custom serialize and hydrate methods.
  flux.serialize = () => {
    var data = {};

    for (var key in stores) {
      data[key] = stores[key].serialize();
    }

    return JSON.stringify(data);
  }

  flux.hydrate = (data) => {
    for (var key in data) {
      stores[key].hydrate(data[key]);
    }
  }

  return flux;
}
