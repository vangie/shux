var net = require('net');
var rshell = require('../../');
var rsh = rshell(require('./keys/drone.json'));

var stream = net.connect(5000, 'localhost');
var dr = rsh.createDrone(require('./keys/authorized.json'));

dr.pipe(stream).pipe(dr);
