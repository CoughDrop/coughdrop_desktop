var cp = require('child_process');

var archs = ["64", "32"];
archs.forEach(function (arch) {
    var path = "..\\cdb\\inst\\" + arch;
    var cmd = "move /Y " + path + "\\CoughDropSetup.exe " + path + "\\coughdrop-setup.exe && move /Y " + path + "\\CoughDropSetup.msi  " + path + "\\coughdrop-setup.msi";
	var child = cp.exec(cmd);

	child.on('close', function(code) {
	    console.log("closed with " + code);
	});
	child.on('error', function(err) {
		console.log("spawn failed");
		console.log(err);
	});
});