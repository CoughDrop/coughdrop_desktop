'use strict';

var releases_url = "https://s3.amazonaws.com/coughdrop/installer/windows/x64";
if(process.arch == 'ia32') {
  releases_url = "https://s3.amazonaws.com/coughdrop/installer/windows/ia32";
}

// Squirrel-Aware code handling, pulled from
// http://www.mylifeforthecode.com/creating-a-windows-distribution-of-an-electron-app-using-squirrel/
var squirrel_app = require('app');
var path = require('path');
var cp = require('child_process');
var migrator = require('migrator');
var auto_updater = require('auto-updater');
var extra_tts = require('acapela/extra-tts');

console.log("ARCH: " + process.arch);
console.log("NODE VERSION: " + process.versions.node);

var handleSquirrelEvent = function() {
  if (process.platform != 'win32') {
    return false;
  }

  function executeSquirrelCommand(args, done) {
    var updateDotExe = path.resolve(path.dirname(process.execPath), 
       '..', 'update.exe');
    var child = cp.spawn(updateDotExe, args, { detached: true });
    child.on('close', function(code) {
      done();
    });
  };

  function install(real_done, app_version) {
    var target = path.basename(process.execPath);
    migrator.start(app_version, function() {
      executeSquirrelCommand(["--createShortcut=coughdrop.exe", target],real_done);            
    })
    console.log("installing");
  };

  function uninstall(done) {
    var target = path.basename(process.execPath);
    executeSquirrelCommand(["--removeShortcut", target], done);
  };

  function save_data_dir(done, app_version) {
    var dest_data_dir = path.resolve(path.dirname(process.execPath), '..', 'data');
    var src_data_dir = path.resolve(path.dirname(process.execPath), 'data');
    migrator.preserve(app_version, done);
  };

  var squirrelEvent = process.argv[1];
  var app_version = process.argv[2];
  switch (squirrelEvent) {
    case '--squirrel-install':
      install(squirrel_app.quit, app_version);
      return true;
    case '--squirrel-updated':
      install(squirrel_app.quit, app_version);
      return true;
    case '--squirrel-obsolete':
      save_data_dir(squirrel_app.quit, app_version);
      return true;
    case '--squirrel-uninstall':
      uninstall(squirrel_app.quit);
      return true;
  }

  return false;
};

if (handleSquirrelEvent()) {
   return;
}

// Auto-check for updates, also pulled from
// http://www.mylifeforthecode.com/creating-a-windows-distribution-of-an-electron-app-using-squirrel/
var last_check = null;
var updated_version = null;
function check_for_updates() {
  var now = (new Date()).getTime();
  // check for update once every 24 hours
  if(last_check && (now - last_check) < (60 * 60 * 24 * 1000)) {
    return;
  }
  last_check = (new Date()).getTime();
  auto_updater.setFeedURL(releases_url);
  auto_updater.on('update-downloaded', function(event, releaseNotes, releaseName, releaseDate, updateURL) {
    console.log("update available, " + releaseName);
    updated_version = releaseName;
  });
  auto_updater.on('update-not-available', function() {
    setTimeout(check_for_updates, 60 * 1000);
  });
//   var updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
//   var child = cp.spawn(updateDotExe, ["--update", releases_url], { detached: true });
//   child.on('close', function(code) {
//     // anything you need to do when update is done.
//   });
//   var stdout = '';
//   child.stdout.setEncoding('utf8');
//   var jsonStarted = false;
//   child.stdout.on('data', function (d) {
//     if (!jsonStarted && d.startsWith("{")) {
//       jsonStarted = true;
//       return stdout += d; 
//     }  
//     if (!jsonStarted) {
//       return;
//     } 
//     return stdout += d; 
//   });
//   child.on('close', function(code) {
//     if (stdout.length > 0) {
//       var data = JSON.parse(stdout);
//       if(data.futureVersion) {
//         updated_version = data.futureVersion;
//       }
//     }
//   });
//   child.on('error', function(err) {
//     console.log("spawn failed");
//     console.log(err);
//   });
};
check_for_updates();

const electron = require('electron');
let gazelinger = require('gazelinger');

const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const ipcMain = require('electron').ipcMain;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  gazelinger.stop_listening();

  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  var load_window = function(debug) {
    // Create the browser window.
    var electronScreen = electron.screen;
    var size = electronScreen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({width: size.width - 50, height: size.height - 50, title: "CoughDrop"});

    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/www/desktop_index.html');
  
    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null;
    });
  
    let contents = mainWindow.webContents;
  
    // Open the DevTools.
    if(debug) {
      contents.openDevTools();
    }

    contents.on('crashed', function() {
      load_window();
    });
  };
  load_window(false);
});

var sender = null;
ipcMain.on('eye-gaze-subscribe', function(event, args) {
  sender = event.sender;
  gazelinger.listen(function(data) {
    if(sender) {
      sender.send('eye-gaze-data', JSON.stringify(data));
    }
  });
});
ipcMain.on('eye-gaze-unsubscribe', function(event, args) {
  sender = null;
  gazelinger.stop_listening()
});

ipcMain.on('full-screen', function(event, message) {
  if(mainWindow) {
    if(message == 'kiosk') {
      mainWindow.setKiosk(true);
    } else if(message == 'fullscreen') {
      mainWindow.setFullScreen(true);
    } else {
      mainWindow.setKiosk(false);
      mainWindow.setFullScreen(false);
    }
  }
});

ipcMain.on('update-check', function(event, message) {
  if(updated_version) {
    event.sender.send('update-available', updated_version);
  }
});
ipcMain.on('update-install', function(event, message) {
  if(updated_version) {
    auto_updater.quitAndInstall();
  }
});

ipcMain.on('extra-tts-ready', function(event, args) {
  event.sender.send('extra-tts-ready', 'ready');
});

ipcMain.on('extra-tts-exec', function(event, message) {
  var sender = event.sender;
  var opts = JSON.parse(message);
  opts.args[0].success = function(res) {
    sender.send('extra-tts-exec-result', JSON.stringify({
      success: true,
      callback_id: opts.success_id,
      result: res
    }));
  };
  opts.args[0].progress = function(res) {
    sender.send('extra-tts-exec-result', JSON.stringify({
      success: true,
      callback_id: opts.progress_id || opts.success_id,
      result: res
    }));
  };
  opts.args[0].error = function(res) {
    sender.send('extra-tts-exec-result', JSON.stringify({
      success: true,
      callback_id: opts.error_id,
      result: res
    }));
  };
    try {
        extra_tts[opts.method].apply(extra_tts, opts.args);
    } catch(e) {
        console.log("extra-tts error!");
        console.log(e);
        opts.args[0].error("uncaught error");
    }
});
