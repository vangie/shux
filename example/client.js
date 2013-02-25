var http = require('http');
var through = require('through');
var duplexer = require('duplexer');

var href = (process.argv[2] ? '/attach/' + process.argv[2] : '/open')
    + '?columns=' + process.stdout.columns + '&rows=' + process.stdout.rows
;
var r = http.request({
    method: 'POST',
    host: 'localhost',
    port: 5000,
    path: href
});
r.setTimeout(0);
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

process.stdout.write(new Buffer([0x1b,0x63]));

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
    console.log();
});
