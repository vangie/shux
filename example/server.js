var http = require('http');
var shux = require('../');
var shx = shux(require('./keys/server.json'));
var qs = require('querystring');
var VERSION = require('../package.json').version;

var server = http.createServer(function (req, res) {
    var params = qs.parse(req.url.split('?')[1]);
    res.connection.setTimeout(0);
    
    if (req.url === '/list') {
        res.end(shx.list().concat('').join('\n'));
    }
    else if (RegExp('^/open\\b').test(req.url)) {
        var sh = shx.createShell(params);
        req.pipe(sh).pipe(res);
        
        var onend = function () { res.end() };
        sh.on('close', onend);
        sh.on('end', onend);
    }
    else if (req.url.split('/')[1] === 'attach') {
        var id = req.url.split('/')[2].split('?')[0];
        var sh = shx.attach(id, params);
        req.pipe(sh).pipe(res);
        
        var onend = function () { res.end() };
        sh.on('close', onend);
        sh.on('end', onend);
    }
    else res.end('shux ' + VERSION)
});
server.listen(5000);
