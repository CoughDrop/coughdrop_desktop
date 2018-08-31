var cp = require('child_process');
var ev = require('./electron-version.js');

var args = {};
for (var idx = 0; idx < process.argv.length; idx++) {
    if (process.argv[idx] && process.argv[idx].match(/^--/) && process.argv[idx].match(/=/)) {
        var parts = process.argv[idx].replace(/^--/, '').split(/=/);
        args[parts[0]] = parts[1];
    }
}

var command = {
    add: function (cmd) {
        command.commands = command.commands || [];
        command.commands.push(cmd);
    },
    next: function() {
        var cmd = command.commands.shift();
        if (cmd && cmd.sleep) {
            setTimeout(function () {
                command.next();
            }, cmd.sleep * 1000);
        } else if (cmd) {
            var opts = {};
            if (opts.cwd) { cmd.cwd = opts.cwd; }
            var child = cp.exec(cmd.cmd,
            function (res) {
                console.log("result", res);
                command.next();
            });
            console.log("\nExecuting...");
            if (cmd.description) { console.log(cmd.description); }
            console.log(cmd.cmd);

            child.on('close', function (code) {
                console.log("closed with " + code);
                command.next();
            });
            child.stdout.on('data', function (data) {
                console.log(data);
            })
            child.on('error', function (err) {
                console.log("spawn failed");
                console.log(err);
            });
        } else {
            console.log("all done!");
        }
    },
    begin: function () {
        if (command.commands) {
            console.log("Let's Begin Now");
            command.next();
        } else {
            console.error("no commands added");
        }
    }
};

console.log(args);

path = "C:\\Users\\Brian\\.node-gyp\\iojs-" + ev.version;
var cmd = "copy " + path + "\\Release\\node.lib " + path + "\\Release\\iojs.lib /Y";
command.add({ cmd: cmd, description: "fixing node release at " + path });

cmd = "copy " + path + "\\ia32\\iojs.lib " + path + "\\ia32\\node.lib /Y && copy " + path + "\\x64\\iojs.lib " + path + "\\x64\\node.lib /Y";
command.add({ cmd: cmd });

command.begin();