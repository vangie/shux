var http = require('http');
var shux = require('../')();
var qs = require('querystring');
var VERSION = require('../package.json').version;
var peer = require('secure-peer')(require('./keys/server.json'));

var server = http.createServer(function (req, res) {
    var params = qs.parse(req.url.split('?')[1]);
    req.pipe(peer(function (stream) {
        var id = req.url.split('/')[1].split('?')[0];
        var sh = shux.shells[id]
            ? shux.attach(id, params)
            : shux.createShell(id, params);
        ;
        sh.pipe(stream).pipe(sh);
        sh.on('end', stream.end.bind(stream));
    })).pipe(res);
});
server.listen(5000);
