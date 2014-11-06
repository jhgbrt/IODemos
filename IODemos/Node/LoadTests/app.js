var http = require('http');
var loadtest = require('loadtest');
var url = require('url');

function getUrls(callback) {
    var options = url.parse(process.argv[2]);
    options.headers = {
        accept: "application/json"
    };
    
    var urls = [];
    
    var onResponse = function (response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });
        response.on('end', function () {
            var json = JSON.parse(str);
            urls = json.map(function (item) { return item.url; });
            callback(urls);
        });
    }
    
    http.request(options, onResponse).end();
}

getUrls(function (urls) {
    console.log(urls);
    var options = {
        url: '{url}',
        indexParam: '{url}',
        paramValues: urls,
        maxRequests: 1000,
        headers: {
            accept: "application/json,text/plain,text/html"
        },
        concurrency: 4,
        requestsPerSecond: 10
    }
    
    loadtest.loadTest(options, function (error, result) {
        if (error) {
            return console.error('Got an error: %s', error);
        }
        console.log('Tests run successfully');
        console.log(result);
    });

});



