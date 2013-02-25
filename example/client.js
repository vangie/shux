var http = require('http');
var through = require('through');
var duplexer = require('duplexer');

var r = http.request({
    method: 'POST',
    host: 'localhost',
    port: 5000,
    path: process.argv[2] ? '/attach/' + process.argv[2] : '/open'
});
r.on('response', function (res) { res.pipe(stdout) });

var stdout = through();
var stdin = through(function (buf) {
    if (buf.length === 1 && buf[0] === 1) {
        state.meta = true;
    }
    else {
        if (state.meta && buf[0] === 'd'.charCodeAt(0)) {
            this.queue(null);
            c.destroy();
        }
        else {
            this.queue(buf);
        }
        state.meta = false;
    }
});

var c = duplexer(r, stdout);
stdin.pipe(c);
c.pipe(process.stdout);
c.on('close', function () { process.exit() });

var state = { meta: false };
process.stdin.pipe(stdin);
process.stdin.resume();

process.stdin.setRawMode(true);
process.on('exit', function () {
    process.stdin.setRawMode(false);
});