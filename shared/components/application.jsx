var Fluxxor = require("fluxxor"),
    React = require("react"),
    Router = require("react-router"),
    Link = Router.Link;

module.exports = React.createClass({
  displayName: "Application",

  mixins: [Fluxxor.FluxMixin(React)],

  render() {
    return (
      <div>
        <h1>Reddit</h1>
        <Router.RouteHandler />
        <hr />
        <ul>
          <li><Link to="subreddit" params={{subreddit: "javascript"}}>/r/javascript</Link></li>
          <li><Link to="subreddit" params={{subreddit: "programming"}}>/r/programming</Link></li>
          <li><Link to="subreddit" params={{subreddit: "funny"}}>/r/funny</Link></li>
        </ul>
      </div>
    );
  }
});
