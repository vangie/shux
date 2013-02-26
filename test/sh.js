var test = require('tap').test;
var shux = require('../');
var through = require('through');

test('sh', function (t) {
    t.plan(1);
    
    var shx = shux();
    var sh0 = shx.createShell('xyz');
    
    sh0.once('data', function () {
        setTimeout(function () {
            sh0.write('echo beep boop');
        }, 1000);
    });
    
    var data0 = '';
    sh0.on('data', function ondata (buf) {
        data0 += buf
        if (!/beep boop/.test(data0)) return;
        
        sh0.end();
        sh0.removeListener('data', ondata);
        
        var sh1 = shx.attach('xyz');
        var data1 = '';
        sh1.write('\n');
        sh1.on('data', function (buf) { data1 += buf });
        
        setTimeout(function () {
            t.equal(data1.match(/beep boop/g).length, 2);
            sh1.end();
            shx.destroy('xyz');
        }, 500);
    });
});
