# nagios-json-status
Parse nagios' status.dat and make it available via HTTP as JSON

We needed a tool for distributing our monitoring data from Nagios. This app reads the status.dat file which Nagios also uses for saving the current status of all hosts/services/etc.
For now, you can only retrieve the status of al services per host. I am planning to add host-status, user-status, etc. soon.

There are no command-line options or other configuration options yet, so if the location of status.dat is not at '/usr/local/nagios/var/status.dat' you have to change the value of the nagiosStatusLocation-variable.

There is more to come soon, please let me know what you think.
And drop me some ideas ;-)

Run with: `node nagios-json-status.js`
Access the JSON via http://[host]:6244/[nagios-host]

For example:
GET http://localhost:6244/my-webserver
