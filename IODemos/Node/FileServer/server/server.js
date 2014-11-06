var http = require("http");
var router = require("./route");

function start(folder, port) {
    router.initialize(folder);
    http.createServer(router.onRequest).listen(port);
    console.log("Server started on port " + port);
}

exports.start = start;