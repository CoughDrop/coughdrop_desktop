'use strict';

var releases_url = "https://s3.amazonaws.com/coughdrop/installer/windows/x64";
if(process.arch == 'ia32') {
  releases_url = "https://s3.amazonaws.com/coughdrop/installer/windows/ia32";
}

// Squirrel-Aware code handling, pulled from
// http://www.mylifeforthecode.com/creating-a-windows-distribution-of-an-electron-app-using-squirrel/
var squirrel_app = require('app');
var path = require('path');
var extra_tts = require('acapela/extra_tts.js');
var cp = require('child_process');

console.log("ARCH: " + process.arch);

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

  function install(done) {
    var target = path.basename(process.execPath);
    executeSquirrelCommand(["--createShortcut", target], done);
  };

  function uninstall(done) {
    var target = path.basename(process.execPath);
    executeSquirrelCommand(["--removeShortcut", target], done);
  };

  var squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
      install(squirrel_app.quit);
      return true;
    case '--squirrel-updated':
      install(squirrel_app.quit);
      return true;
    case '--squirrel-obsolete':
      squirrel_app.quit();
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
function check_for_updates() {
  var now = (new Date()).getTime();
  // check for update once every 24 hours
  if(last_check && (now - last_check) < (60 * 60 * 24 * 1000)) {
    return;
  }
  last_check = (new Date()).getTime();
  var updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
  var child = cp.spawn(updateDotExe, ["--update", releases_url], { detached: true });
  child.on('close', function(code) {
    // anything you need to do when update is done.
  });
  child.on('error', function(err) {
    console.log("spawn failed");
    console.log(err);
  });
  setTimeout(check_for_updates, 60 * 1000);
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
  // Create the browser window.
  var electronScreen = electron.screen;
  var size = electronScreen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({width: size.width - 50, height: size.height - 50});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/www/desktop_index.html');
  
  // Open the DevTools.
//   mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
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

ipcMain.on('extra-tts-download-file', function(event, str) {
  var sender = event.sender;
  var opts = JSON.parse(str);
  console.log("downloading file on main process");
  extra_tts.download_file(opts.url, opts.path, function(percent, done, error) {
    sender.send('extra-tts-download-file-progress', JSON.stringify({
      size: size,
      done: done,
      error: error
    });
  });
});

ipcMain.on('extra-tts-unzip-file', function(event, str) {
  var sender = event.sender;
  var opts = JSON.parse(str);
  console.log("unzipping file on main process");
  extra_tts.unzip_file(opts.file, opts.dir, function(percent, done, error) {
    sender.set('extra-tts-upzip-file-progress', JSON.stringify({
      entries: entries,
      done: done,
      error: error
    });
  });
});

ipcMain.on('extra-tts-ready', function() {
  event.sender.send('extra-tts-ready', 'ready');
});