var React = require("react"),
    Router = require("react-router"),
    Route = Router.Route;

var Application = require("./components/application.jsx"),
    Subreddit = require("./components/subreddit.jsx");

var routes = (
  <Route handler={Application} path="/">
    <Route name="subreddit" handler={Subreddit} path="/r/:subreddit" />
  </Route>
);

module.exports = routes;
