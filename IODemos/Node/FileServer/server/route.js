var fs = require("fs");
var path = require("path");
var url = require("url");
var _dir = "";

function serveFile(request, response) {
    var pathname = url.parse(request.url).pathname;
    var filename = path.join(_dir, pathname);
    fs.exists(filename, function (exists) {
        if (!exists) {
            response.writeHead(404, { "Content-Type": "text/plain" });
            response.write("404 Not Found\n");
            console.log(response.statusCode);
            response.end();
            return;
        }
        var stats = fs.statSync(filename);
        var file = fs.createReadStream(filename);
        response.writeHead(200, { 'Content-Length': stats.size });
        response.on('close', file.destroy.bind(file));
        file.pipe(response);
    });
}

function writeHtml(files, request, response) {
    response.writeHead(200, { "Content-Type" : "text/html" });
    response.write('<ul>');
    files.forEach(function (f) {
        response.write('<li><a href="/' + f + '">' + f + '</a></li>');
    });
    response.write('</ul>');
}

function writeJson(files, request, response) {
    response.writeHead(200, { "Content-Type" : "application/json" });
    response.write(JSON.stringify(files.map(function(f) {
        var s = fs.statSync(path.join(_dir, f));
        var u = {
            host: request.headers.host,
            pathname : '/' + f,
            protocol : 'http',
            port: request.headers.port
        };
        var uri = url.format(u);
        console.log(uri );
        return {
            fileName: f, 
            size: s.size, 
            url: uri
        }
    })));
}

function write(contentType, files, request, response) {
    switch (contentType) {
        case "text/html":
            writeHtml(files, request, response);
            break;
        case "text/json":
        case "application/json":
        default :
            writeJson(files, request, response);
            break;
    }
}

function onRequest(request, response) {
    console.log(request.url);
    var pathname = url.parse(request.url).pathname;
    console.log("Routing " + pathname);
    var accept = request.headers['accept'].split(',')[0];
    console.log(accept);
    switch (pathname) {
        case '/':
        case '/list':
            fs.readdir(_dir, function (err, files) {
                if (err) {
                    response.writeHead(500, { "Content-Type": "text/plain" });
                    response.write('500 ' + err);
                    response.end();
                    return;
                }
                write(accept, files, request, response);
                response.end();
            });
            break;
        default :
            serveFile(request, response);
            break;
    }
}

function initialize(dir) {
  _dir = dir;
}

exports.onRequest = onRequest;
exports.initialize = initialize;