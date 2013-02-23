var http = require('http');
var shux = require('../');
var sh = shux(require('./keys/server.json'));

var server = http.createServer(function (req, res) {
    if (req.url === '/list') {
        res.end(sh.list().concat('').join('\n'));
    }
    else if (RegExp('^/open\\b').test(req.url)) {
        req.pipe(sh.createShell()).pipe(res);
    }
    else if (req.url.split('/')[1] === 'attach') {
        var id = req.url.split('/')[2];
        req.pipe(sh.attach(id)).pipe(res);
    }
});
server.listen(5000);
