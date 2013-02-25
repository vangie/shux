var http = require('http');
var through = require('through');
var request = require('request');

var href = 'http://localhost:5000/'
    + (process.argv[2] ? 'attach/' + process.argv[2] : 'open')
    + '?columns=' + process.stdout.columns + '&rows=' + process.stdout.rows
;
var r = request.post(href);
r.on('close', function () { process.exit() });

var state = { meta: false };
process.stdin.setRawMode(true);
process.stdin.pipe(through(function (buf) {
    if (buf.length === 1 && buf[0] === 1) {
        state.meta = true;
    }
    else {
        if (state.meta && buf[0] === 'd'.charCodeAt(0)) {
            this.queue(null);
            process.exit();
        }
        else {
            this.queue(buf);
        }
        state.meta = false;
    }
})).pipe(r).pipe(process.stdout);

process.on('exit', function () {
    process.stdin.setRawMode(false);
    console.log();
});
