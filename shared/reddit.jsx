var { EventEmitter } = require("events");

/**
 * `Reddit` connects to the Reddit API and fetches JSON data.
 *
 * When it begins or finishes a request, it will emit a `reqs`
 * event with the number of requests still waiting for a response
 * as the first argument.
 *
 * As its first argument, `Reddit` takes an object that should
 * have a single method called `fetch`; that method should take
 * a URL to fetch and a standard Node-style callback, and should
 * perform the actual work of performing the HTTP request. This
 * allows us to inject a different strategy for hitting the Reddit
 * API on the client and server.
 */
class Reddit extends EventEmitter {
  constructor(fetcher) {
    super();
    this.reqs = 0;
    this.fetcher = fetcher;
    this.baseUrl = "http://www.reddit.com/";
  }

  get(path, callback) {
    this.emit("reqs", ++this.reqs);
    var url = this.baseUrl + path;
    this.fetcher.fetch(url, (err, data) => {
      try {
        callback(err, data);
      } finally {
        this.emit("reqs", --this.reqs);
      }
    });
  }

  getSubreddit(subreddit, callback) {
    return this.get(`/r/${subreddit}.json`, callback);
  }
}

module.exports = Reddit;
