var cp = require('child_process');
var packager = require('electron-packager');

// "package": "node packaging_prep.js x64 && electron-packager ./ CoughDrop --overwrite --prune --asar=true --platform=win32 --arch=all --icon=\"coughdrop.ico\" --ignore=\"build\" --ignore=\"data\" --out=\"../cdb\" --version=1.3.4 --version-string.CompanyName=\"CoughDrop\" --version-string.ProductName=\"CoughDrop\"",
packager({
  dir: "./",
  name: "CoughDrop",
  overwrite: true,
  prune: true,
  asar: true,
  platform: "win32",
  arch: "all",
  icon: "./coughdrop.ico",
  ignore: ["build", "data"],
  out: "../cdb",
  version: "1.3.4",
  "version-string": {
    FileDescription: "CoughDrop",
    CompanyName: "CoughDrop",
    ProductName: "CoughDrop",
    OriginalFilename: "coughdrop.exe"
  },
  win32metadata: {
    FileDescription: "CoughDrop",
    CompanyName: "CoughDrop",
    ProductName: "CoughDrop",
    OriginalFilename: "coughdrop.exe"
  },
  afterCopy: [function (path, version, platform, arch, done) {
      path = path.replace(/\\resources\\app/, '');
      console.log("installed temporarily to " + path);
      var cmd = "md " + path + "\\resources\\app\\node_modules\\form-data";
      cmd = cmd + " & xcopy .\\node_modules\\form-data\\* " + path + "\\resources\\app\\node_modules\\form-data /Y /S";
      cmd = cmd + " && copy .\\AcaTTS.* " + path + " /Y";
      cmd = cmd + " && copy .\\coughdrop.ico " + path + " /Y";
      cmd = cmd + " && copy .\\logo.png " + path + " /Y";
      if (arch == 'x64') {
          cmd = cmd + " && copy ..\\eyex\\x64\\Tobii.EyeX.*.dll " + path + " /Y";
          cmd = cmd + " && copy ..\\eyex\\eyex.64.node " + path + "\\resources\\app\\node_modules\\eyex\\eyex.node /Y";
          cmd = cmd + " && copy ..\\acapela\\acapela.64.node " + path + "\\resources\\app\\node_modules\\acapela\\acapela.node /Y";
      } else {
          cmd = cmd + " && copy ..\\eyex\\x86\\Tobii.EyeX.*.dll " + path + " /Y";
          cmd = cmd + " && copy ..\\eyex\\eyex.32.node " + path + "\\resources\\app\\node_modules\\eyex\\eyex.node /Y";
          cmd = cmd + " && copy ..\\acapela\\acapela.32.node " + path + "\\resources\\app\\node_modules\\acapela\\acapela.node /Y";
      }
      cmd = cmd + " && md " + path + "\\bin";
      cmd = cmd + " & copy .\\bin\\* " + path + "\\bin /Y";
      cmd = cmd + " && rmdir " + path + "\\resources\\app\\files /s /q";
      var child = cp.exec(cmd);
      console.log("running for " + arch);
      console.log(cmd);

      child.on('close', function (code) {
          console.log("closed with " + code);
          done();
      });
      child.stdout.on('data', function (data) {
          console.log(data);
      })
      child.on('error', function (err) {
          console.log("spawn failed");
          console.log(err);
          done();
      });

  }]
}, function (err, appPaths) {

});
//console.log("cleaning up!");
//console.log(JSON.stringify(process.argv));
//arch = process.argv[2];
//var archs = ["x64", "ia32"];
//archs.forEach(function(arch) {
//});