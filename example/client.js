var through = require('through');
var request = require('request');
var peer = require('secure-peer')(require('./keys/client.json'));

var href = 'http://localhost:5000/' + process.argv[2]
    + '?columns=' + process.stdout.columns
    + '&rows=' + process.stdout.rows
;
var r = request.post(href);
r.on('close', function () { process.exit() });

var keyboard = through(function (buf) {
    if (buf.length === 1 && buf[0] === 1) return state.meta = true;
    
    if (state.meta && buf[0] === 'd'.charCodeAt(0)) {
        this.queue(null);
        process.exit();
    }
    else {
        this.queue(buf);
    }
    state.meta = false;
});
var sec = peer(function (stream) {
    keyboard.pipe(stream).pipe(process.stdout);
});
sec.pipe(r).pipe(sec);

var state = { meta: false };
process.stdin.setRawMode(true);
process.stdin.pipe(keyboard);

process.on('exit', function () {
    process.stdin.setRawMode(false);
    console.log();
});
