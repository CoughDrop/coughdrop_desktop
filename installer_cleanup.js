var cp = require('child_process');

var archs = ["64", "32"];
archs.forEach(function(arch) {
	var cmd = "move /Y .\\build\\installer\\" + arch + "\\CoughDropSetup.exe .\\build\\installer\\" + arch + "\\coughdrop-setup.exe && move /Y .\\build\\installer\\" + arch + "\\CoughDropSetup.msi  .\\build\\installer\\" + arch + "\\coughdrop-setup.msi";
	var child = cp.exec(cmd);

	child.on('close', function(code) {
	    console.log("closed with " + code);
	});
	child.on('error', function(err) {
		console.log("spawn failed");
		console.log(err);
	});
});