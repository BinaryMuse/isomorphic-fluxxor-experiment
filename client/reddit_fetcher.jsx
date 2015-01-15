var jsonp = require("jsonp");

/**
 * The client Reddit fetcher uses the jsonp module
 * to request the given URL from Reddit's JSONP API.
 */
module.exports = {
  fetch: (url, callback) => {
    return jsonp(url, {param: "jsonp"}, callback);
  }
};
