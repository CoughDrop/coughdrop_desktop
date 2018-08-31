var cp = require('child_process');
var ev = require('./electron-version.js');

// "install-node-version": "node-gyp install --target=1.8.2 --arch=x64 --dist-url=https://gh-contractor-zcbenz.s3.amazonaws.com/atom-shell/dist",


console.log("ensuring correct node-gyp, " + ev.version);

var cmd = "node-gyp install --target=1.8.2 --arch=x64 --dist-url=https://atom.io/download/electron";
var child = cp.exec(cmd);
console.log(cmd);

child.on('close', function (code) {
    console.log("closed with " + code);
});
child.stdout.on('data', function (data) {
    console.log(data);
})
child.on('error', function (err) {
    console.log("spawn failed");
    console.log(err);
});
