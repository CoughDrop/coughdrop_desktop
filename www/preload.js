window.ipcRenderer = require('electron').ipcRenderer;

var fs = require('fs');
var fs_path = require('path');
try {
    var disk = require('diskusage');
    var os = require('os');
} catch(e) { }

window.fs_access = {
    readdir: fs.readdir,
    stat: fs.stat,
    mkdir: fs.mkdir,
    writeFile: fs.writeFile,
    readFile: fs.readFile,
    basename: fs_path.basename,
    resolve: fs_path.resolve,
    dirname: fs_path.dirname,
    platform: os && os.platform(),
    check: disk && disk.check,
    localdir: process.env.LOCALAPPDATA,
    cwd: process.cwd,
    execPath: process.execPath,
    buffer: Buffer
};

window.node_extras = {
};
try {
    var path = 'gazelinger/electron-listener.js';
    window.node_extras.eye_gaze = require(path);
} catch(e) { console.error("error loading eye gaze", e); }

try {
    window.node_extras.extra_tts = require('acapela/extra-tts');
    var tts_path = 'acapela/extra-tts-ipc.js';
    window.node_extras.tts = require(tts_path);
    window.node_extras.tts.base_dir = fs_path.resolve(process.env.LOCALAPPDATA, 'coughdrop');

} catch(e) { console.error("error loading extra-tts", e); }

try {
    window.node_extras.sapi = require('sapi_tts/tts.js');
} catch(e) { console.error("error loading SAPI", e); }

try {
    window.node_extras.audio = require('win-audio');
} catch(e) { console.error("error loading win-audio", e); }