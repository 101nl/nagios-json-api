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
        var nagiosStatus = {};

        var nagiosServices = {};
        var nagiosInfo = {};
        var nagiosProgramStatus = {};
        var nagiosHosts = {};
        var nagiosContacts = {};

        var lines = contents.split("\n");
        // console.log(lines);return;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            // Continue if line is empty or comment
            if (line == '') continue;
            if (line.substr(0, 1) == '#') continue;

            if (line.substr(0, 1) != "\t" && line.substr(line.length - 1, line.length) == '{') {

                if (line.substr(0, 13) == 'servicestatus') {
                    // Save services per host

                    var service = {};
                    var hostname = lines[i + 1].split('=')[1];

                    if (nagiosServices[hostname] === undefined) {
                        nagiosServices[hostname] = [];
                    }

                    var line = '';
                    var serviceContent = {};

                    i++;
                    while ((line = lines[i]) !== "\t}") {
                        // line = lines[i];

                        var arr = line.substr(1, line.length).split('=');
                        if (arr[0] != 'host_name') {
                            serviceContent[arr[0]] = arr[1];
                        }

                        i++;
                    }

                    nagiosServices[hostname].push(serviceContent);

                } else if (line.substr(0, 13) == 'programstatus') {
                    // Save programstatus

                    i++;
                    while ((line = lines[i]) !== "\t}") {
                        var arr = line.substr(1, line.length).split('=');
                        nagiosProgramStatus[arr[0]] = arr[1];

                        i++;
                    }

                } else if (line.substr(0, 10) == 'hoststatus') {
                    // Save hoststatus
                    var hostname = lines[i + 1].split('=')[1];

                    if (nagiosHosts[hostname] === undefined) {
                        nagiosHosts[hostname] = {};
                    }

                    i++;
                    while ((line = lines[i]) !== "\t}") {
                        var arr = line.substr(1, line.length).split('=');
                        nagiosHosts[hostname][arr[0]] = arr[1];

                        i++;
                    }
                } else if (line.substr(0, 13) == 'contactstatus') {
                    // Save contactstatus
                    var contactName = lines[i + 1].split('=')[1];

                    if (nagiosContacts[contactName] === undefined) {
                        nagiosContacts[contactName] = {};
                    }

                    i++;
                    while ((line = lines[i]) !== "\t}") {
                        var arr = line.substr(1, line.length).split('=');
                        nagiosContacts[contactName][arr[0]] = arr[1];

                        i++;
                    }
                } else if (line.substr(0, 4) == 'info') {
                    // Save nagios info
                    i++;
                    while ((line = lines[i]) !== "\t}") {
                        var arr = line.substr(1, line.length).split('=');
                        nagiosInfo[arr[0]] = arr[1];

                        i++;
                    }
                }

            }
        }

        // Combine
        nagiosStatus['services'] = nagiosServices;
        nagiosStatus['programStatus'] = nagiosProgramStatus;
        nagiosStatus['hosts'] = nagiosHosts;
        nagiosStatus['contacts'] = nagiosContacts;
        nagiosStatus['info'] = nagiosInfo;

        return nagiosStatus;
    }

}

// *** Main ***
var statusReader = new StatusReader();
var nagiosStatus = statusReader.parseFileContents(statusReader.getFileContents());

setInterval(function() {
    nagiosStatus = statusReader.parseFileContents(statusReader.getFileContents());
}, 10000);

// Create simple webserver
var http = require('http');
http.createServer(function(req, res) {

    var url = req.url.substr(1, req.url.length).split('/');
    var data = null;

    if (req.url == '/') {
        res.writeHead(404);
        res.end('Not found\n');
    }

    try {
        switch (url[0]) {
            case 'services':
                if (url[1] !== undefined && nagiosStatus['services'][url[1]] !== undefined) {
                    data = nagiosStatus['services'][url[1]];
                } else {
                    throw new Error(404);
                }
                break;
            case 'host':
                if (url[1] !== undefined && nagiosStatus['hosts'][url[1]] !== undefined) {
                    data = nagiosStatus['hosts'][url[1]];
                } else {
                    throw new Error(404);
                }
                break;
            case 'contact':
                if (url[1] !== undefined && nagiosStatus['contacts'][url[1]] !== undefined) {
                    data = nagiosStatus['contacts'][url[1]];
                } else {
                    throw new Error(404);
                }
                break;
            case 'programStatus':
                data = nagiosStatus['programStatus'];
                break;
            case 'info':
                data = nagiosStatus['info'];
                break;
            case 'all':
                data = nagiosStatus;
                break;
        }
    } catch (err) {
        res.writeHead(err.message);
        res.end('Not found');
        return;
    }

    if (data !== null) {
        res.writeHead(200, { "Content-type": "application/json" });
        res.end(JSON.stringify(data));
    }

    return;

}).listen(6244);
