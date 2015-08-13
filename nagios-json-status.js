'use strict';

function StatusReader() {

    var self = this;
    var fs = require('fs');
    var nagiosStatusLocation = '/usr/local/nagios/var/status.dat';

    this.getFileContents = function() {
        var buffer = fs.readFileSync(nagiosStatusLocation);
        return buffer.toString();
    }

    this.parseFileContents = function(contents) {
        var hosts = {};

        var lines = contents.split("\n");
        // console.log(lines);return;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            // Continue if line is empty or comment
            if (line == '') continue;
            if (line.substr(0, 1) == '#') continue;

            if (line.substr(0, 1) != "\t" && line.substr(line.length - 1, line.length) == '{' && line.substr(0, 13) == 'servicestatus') {

                var service = {};
                var hostname = lines[i + 1].split('=')[1];

                if (hosts[hostname] === undefined) {
                    hosts[hostname] = [];
                }

                var line = '';
                var serviceContent = {};
                i++;
                while ((line = lines[i]) !== "\t}") {
                    line = lines[i];

                    var arr = line.substr(1, line.length).split('=');
                    if (arr[0] != 'host_name') {
                        serviceContent[arr[0]] = arr[1];
                    }

                    i++;
                }

                hosts[hostname].push(serviceContent);

            }
        }

        return hosts;
    }

}

// Read status from Nagios

var statusReader = new StatusReader();
var hosts = statusReader.parseFileContents(statusReader.getFileContents());

setInterval(function() {
    hosts = statusReader.parseFileContents(statusReader.getFileContents());
}, 10000);

// Create simple webserver
var http = require('http');
http.createServer(function(req, res) {
    if (req.url == '/') {
        res.writeHead(404);
        res.end('Not found\n');
    }

    var nagiosHost = hosts[req.url.substr(1, req.url.length)];
    if (nagiosHost !== undefined) {
        res.writeHead(200, { "Content-type": "application/json" })
        res.end(JSON.stringify(nagiosHost));
    } else {
        res.writeHead(404);
        res.end('Not found\n');
    }

}).listen(6244);
