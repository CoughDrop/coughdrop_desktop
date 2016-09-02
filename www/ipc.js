var ipcRenderer = requireNode('electron').ipcRenderer;
var path = '../node_modules/gazelinger/electron-listener.js';
var tts_path = '../node_modules/acapela/extra-tts-ipc.js';
if(location.pathname) {
  path = location.pathname.replace(/^\//, '').replace(/www\/desktop_index\.html.*$/, 'node_modules/gazelinger/electron-listener.js');
  tts_path = location.pathname.replace(/^\//, '').replace(/www\/desktop_index\.html.*$/, 'node_modules/acapela/extra-tts-ipc.js');
}
var eye_gaze = requireNode(path);
if(window.capabilities) {
  window.capabilities.eye_gaze.listen = eye_gaze.listen;
  window.capabilities.eye_gaze.stop_listening = eye_gaze.stop_listening;
  window.capabilities.eye_gaze.available = true;
}

var tts = requireNode(tts_path);
if (window.capabilities) {
    window.extra_tts = tts;
    window.capabilities.tts.extra_exec = tts.exec;
    window.capabilities.debugging = {
      available: function() { return true; },
      show: function() {
        ipcRenderer.send('debugging-show', 'show');
      }
    };
}

window.full_screen = function(go_full) {
  ipcRenderer.send('full-screen', go_full ? 'kiosk' : 'end');
  return true;
};

setInterval(function() {
  ipcRenderer.send('update-check', 'check');
}, 5000);
ipcRenderer.on('update-available', function(event, message) {
  window.CoughDrop.update_version = message;
  window.CoughDrop.install_update = function() {
    ipcRenderer.send('update-install', 'go');
  };
});

coughDropExtras.advance('device');
