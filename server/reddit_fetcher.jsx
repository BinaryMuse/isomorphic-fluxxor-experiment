var superagent = require("superagent");

/**
 * The server Reddit fetcher uses superagent to
 * request the given URL from Reddit's JSON API.
 */
module.exports = {
  fetch: (url, callback) => {
    return superagent
      .get(url)
      .end((res) => callback(null, res.body));
  }
};
