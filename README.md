# nagios-json-api
Nagios API!

Parse nagios' status.dat and make it available via HTTP as JSON

We needed a tool for distributing our monitoring data from Nagios. This app reads the status.dat file which Nagios also uses for saving the current status of all hosts/services/etc.

# Running
Run with: `node nagios-json-status.js`
Access the JSON via http://[host]:6244/services/[nagios-host]

# Examples
`GET http://localhost:6244/services/my-webserver`

`GET http://localhost:6244/host/my-webserver`

`GET http://localhost:6244/all`

`GET http://localhost:6244/info`

`GET http://localhost:6244/programStatus`

`GET http://localhost:6244/contact/hans`
