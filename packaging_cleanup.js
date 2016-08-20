var cp = require('child_process');

var archs = ["x64", "ia32"];
archs.forEach(function(arch) {
    var cmd = "md ..\\cdb\\CoughDrop-win32-" + arch + "\\resources\\app\\node_modules\\form-data";
    cmd = cmd + " & xcopy .\\node_modules\\form-data\\* ..\\cdb\\CoughDrop-win32-" + arch + "\\resources\\app\\node_modules\\form-data /Y /S";
    cmd = cmd + " && copy .\\AcaTTS.* ..\\cdb\\CoughDrop-win32-" + arch + " /Y";
    if (arch == 'x64') {
        cmd = cmd + " && copy ..\\eyex\\x64\\Tobii.EyeX.*.dll ..\\cdb\\CoughDrop-win32-" + arch + " /Y";
        cmd = cmd + " && copy ..\\eyex\\eyex.64.node ..\\cdb\\CoughDrop-win32-" + arch + "\\resources\\app\\node_modules\\eyex\\eyex.node /Y";
        cmd = cmd + " && copy ..\\acapela\\acapela.64.node ..\\cdb\\CoughDrop-win32-" + arch + "\\resources\\app\\node_modules\\acapela\\acapela.node /Y";
    } else {
        cmd = cmd + " && copy ..\\eyex\\x86\\Tobii.EyeX.*.dll ..\\cdb\\CoughDrop-win32-" + arch + " /Y";
        cmd = cmd + " && copy ..\\eyex\\eyex.32.node ..\\cdb\\CoughDrop-win32-" + arch + "\\resources\\app\\node_modules\\eyex\\eyex.node /Y";
        cmd = cmd + " && copy ..\\acapela\\acapela.32.node ..\\cdb\\CoughDrop-win32-" + arch + "\\resources\\app\\node_modules\\acapela\\acapela.node /Y";
    }
    cmd = cmd + " && md ..\\cdb\\CoughDrop-win32-" + arch + "\\bin";
    cmd = cmd + " & copy .\\bin\\* ..\\cdb\\CoughDrop-win32-" + arch + "\\bin /Y";
    var child = cp.exec(cmd);
    console.log("running for " + arch);
    console.log(cmd);

	child.on('close', function(code) {
	    console.log("closed with " + code);
	});
	child.stdout.on('data', function (data) {
	    console.log(data);
	})
	child.on('error', function(err) {
		console.log("spawn failed");
		console.log(err);
	});
});