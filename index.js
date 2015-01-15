var http = require("http"),
    express = require("express");

require("node-jsx").install({extension: ".jsx", harmony: true});

var app = express(),
    server = http.createServer(app);

require("./server/web")(app);

var port = process.env.PORT || 8182;
server.listen(port, function() {
  console.log("Listening at http://localhost:" + port);
});
