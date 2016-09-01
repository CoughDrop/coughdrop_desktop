var cp = require('child_process');

path = "C:\\Users\\Brian\\.node-gyp\\iojs-1.3.4\\Release";
console.log("fixing node release at " + path);
var cmd = "copy " + path + "\\node.lib " + path + "\\iojs.lib /Y";
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
