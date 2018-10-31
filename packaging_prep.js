var cp = require('child_process');
var packager = require('electron-packager');
var file = require('fs');

// read package.json, get
var json = JSON.parse(file.readFileSync("package.json", { encoding: 'utf-8' }));
var version = json.version;
console.log("version", version);
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
  ignore: ["build", "data", "files"],
  out: "../cdb",
  version: "2.0.4", // 1.3.4
  appVersion: version,
  "version-string": {
    FileDescription: "CoughDrop",
    FileVersion: version,
    CompanyName: "CoughDrop",
    ProductName: "CoughDrop",
    ProductVersion: version,
    OriginalFilename: "coughdrop.exe"
  },
  win32metadata: {
    FileDescription: "CoughDrop",
    FileVersion: version,
    CompanyName: "CoughDrop",
    ProductName: "CoughDrop",
    ProductVersion: version,
    OriginalFilename: "coughdrop.exe"
  },
  afterCopy: [function (path, version, platform, arch, done) {
      path = path.replace(/\\resources\\app/, '');
      console.log("installed temporarily to " + path);
      var cmd = "md " + path + "\\resources\\app\\node_modules\\form-data";
      cmd = cmd + "  & xcopy .\\node_modules\\form-data\\* " + path + "\\resources\\app\\node_modules\\form-data /Y /S";
      cmd = cmd + "  & xcopy .\\node_modules\\psl\\data\\* " + path + "\\resources\\app\\node_modules\\psl\\data\\ /Y /S";
      cmd = cmd + "  & xcopy .\\node_modules\\ajv\\lib\\* " + path + "\\resources\\app\\node_modules\\ajv\\lib\\ /Y /S";
      cmd = cmd + " && echo a && xcopy .\\bin " + path + "\\bin /Y /E /I";
      cmd = cmd + " && echo b && copy .\\AcaTTS.* " + path + " /Y";
      cmd = cmd + " && echo c && copy .\\coughdrop.ico " + path + " /Y";
      cmd = cmd + " && echo d && copy .\\logo.png " + path + " /Y";
//      cmd = cmd + " && echo d && rmdir " + path + "\\resources\\app\\files /s /q";
      if (arch == 'x64') {
          cmd = cmd + " && echo e && copy ..\\eyex\\lib\\x64\\Tobii.EyeX.*.dll " + path + " /Y";
//          cmd = cmd + " && echo f && copy ..\\eyex\\eyex.64.node " + path + "\\resources\\app\\node_modules\\eyex\\eyex.node /Y";
//          cmd = cmd + " && echo g && copy ..\\acapela\\acapela.64.node " + path + "\\resources\\app\\node_modules\\acapela\\acapela.node /Y";
      } else {
          cmd = cmd + " && echo h && copy ..\\eyex\\lib\\x86\\Tobii.EyeX.*.dll " + path + " /Y";
//          cmd = cmd + " && echo j && copy ..\\acapela\\acapela.32.node " + path + "\\resources\\app\\node_modules\\acapela\\acapela.node /Y";
//          cmd = cmd + " && echo i && copy ..\\eyex\\eyex.32.node " + path + "\\resources\\app\\node_modules\\eyex\\eyex.node /Y";
      }
      cmd = cmd + " && echo \"done with actions\"";
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
}).then(function (appPaths) {
    console.log("done!");
    console.log(appPaths);
    appPaths.forEach(function(path) {
        var cmd = "md " + path + "\\edge && xcopy .\\edge " + path + "\\edge /Y /S";
        cp.exec(cmd);
    });
});
