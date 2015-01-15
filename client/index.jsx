var React = require("react"),
    Router = require("react-router");

var Reddit = require("../shared/reddit.jsx"),
    ClientRedditFetcher = require("./reddit_fetcher.jsx"),
    Routes = require("../shared/routes.jsx"),
    Flux = require("../shared/flux.jsx");

// We use a client version of the Reddit fetcher here.
var reddit = new Reddit(ClientRedditFetcher);

var flux = Flux(reddit);
// If we got initial store data from the server, use it.
if (window.fluxData) {
  flux.hydrate(window.fluxData);
}

Router.run(Routes, Router.HistoryLocation, (Handler, state) => {
  React.render(
    <Handler key={state.path} flux={flux} />,
    document.getElementById("app-container")
  );
});
