var secure = require('secure-peer');
var pty = require('pty.js');
var muxDemux = require('mux-demux');
var through = require('through');
var duplexer = require('duplexer');

module.exports = function (keys) {
    return new Shux(keys);
};

function Shux (keys) {
    this.peer = secure(keys);
    this.shells = {};
}

Shux.prototype.list = function () {
    return Object.keys(this.shells);
};

Shux.prototype.attach = function (id) {
    var pts = this.shells[id].pts;
    var stdin = through();
    var stout = through();
    stdin.pipe(pts, { end: false });
    pts.pipe(stdout);
    return duplexer(stdin, stdout);
};

Shux.prototype.createShell = function (opts) {
    if (!opts) opts = {};
    var cmd = opts.command || 'bash';
    var args = opts.arguments || [];
    if (Array.isArray(cmd)) {
        args = cmd.slice(1);
        cmd = cmd[0];
    }
    
    var id = opts.id;
    if (id === undefined) {
        id = Math.floor(Math.pow(16,4) * Math.random()).toString(16);
    }
    
    var pts = pty.spawn(cmd, args, {
        cwd: '/',
        cols: opts.columns,
        rows: opts.rows,
        cwd: opts.cwd
    });
    
    this.shells[id] = pts;
    
    return pts;
};
