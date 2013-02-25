var secure = require('secure-peer');
var pty = require('pty.js');
var spawn = require('child_process').spawn;
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
    var pts = this.shells[id];
    var stdin = through();
    var stdout = through();
    stdin.pipe(pts, { end: false });
    pts.pipe(stdout);
    return duplexer(stdin, stdout);
};

Shux.prototype.destroy = function (id, sig) {
    var sh = this.shells[id];
    if (!sh) return false;
    sh.kill(sig);
    return true;
};

Shux.prototype.createShell = function (opts) {
    var self = this;
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
    pts.on('exit', function () {
        delete self.shells[id];
        pts.emit('end');
    });
    
    this.shells[id] = pts;
    
    return pts;
};
