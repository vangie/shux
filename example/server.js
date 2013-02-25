var http = require('http');
var shux = require('../');
var shx = shux(require('./keys/server.json'));

var server = http.createServer(function (req, res) {
    if (req.url === '/list') {
        res.end(shx.list().concat('').join('\n'));
    }
    else if (RegExp('^/open\\b').test(req.url)) {
        var sh = shx.createShell();
        req.pipe(sh).pipe(res);
        
        var onend = function () { res.end() };
        sh.on('close', onend);
        sh.on('end', onend);
    }
    else if (req.url.split('/')[1] === 'attach') {
        var id = req.url.split('/')[2];
        req.pipe(shx.attach(id)).pipe(res);
        
        var onend = function () { res.end() };
        sh.on('close', onend);
        sh.on('end', onend);
    }
});
server.listen(5000);
