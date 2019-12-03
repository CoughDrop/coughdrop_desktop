var cp = require('child_process');
var ev = require('./electron-version.js');

// "install-node-version": "node-gyp install --target=1.8.2 --arch=x64 --dist-url=https://gh-contractor-zcbenz.s3.amazonaws.com/atom-shell/dist",


console.log("ensuring correct node-gyp, " + ev.version);

// This failed unexpectedly because the dist-url didn't have
// any arm64 resources. I had to manually remove the lookup
// in nodejs's node-gyp directory to make it work.

var cmd = "node-gyp install --target=" + ev.version + " --arch=x64 --dist-url=https://electronjs.org/headers";
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
