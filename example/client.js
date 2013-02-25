var http = require('http');
var through = require('through');
var duplexer = require('duplexer');

var r = http.request({
    method: 'POST',
    host: 'localhost',
    port: 5000,
    path: '/open'
});
r.on('response', function (res) { res.pipe(out) });

var out = through();
var c = duplexer(r, out);
c.on('close', function () { process.exit() });

var state = { meta: false };
process.stdin.pipe(c);
process.stdin.on('data', function (buf) {
    if (buf.length === 1 && buf[0] === 1) {
        state.meta = true;
    }
    else {
        if (state.meta && buf[0] === 'd'.charCodeAt(0)) {
            process.exit();
        }
        state.meta = false;
    }
});

c.pipe(process.stdout);
process.stdin.resume();

process.stdin.setRawMode(true);
process.on('exit', function () {
    process.stdin.setRawMode(false);
});
