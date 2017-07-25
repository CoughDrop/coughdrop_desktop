var ipcRenderer = requireNode('electron').ipcRenderer;

try {
    var path = 'gazelinger/electron-listener.js';
    var eye_gaze = requireNode(path);
    if (window.capabilities) {
        window.capabilities.eye_gaze.listen = eye_gaze.listen;
        window.capabilities.eye_gaze.stop_listening = eye_gaze.stop_listening;
        window.capabilities.eye_gaze.available = true;
    }
} catch (e) { }

try {
    var tts_path = 'acapela/extra-tts-ipc.js';
    var tts = requireNode(tts_path);
    if (window.capabilities) {
        tts.reload = tts.reload || function () { };
        window.extra_tts = tts;
        window.capabilities.tts.extra_exec = tts.exec;
        window.capabilities.debugging = {
            available: function () { return true; },
            show: function () {
                ipcRenderer.send('debugging-show', 'show');
            }
        };
    }
} catch (e) { }

var ds = 0;
document.addEventListener('keypress', function (e) {
    if (e.target.tagName != 'INPUT' && e.target.tagName != 'TEXTAREA' && (e.keyCode == 100 || e.keyCode == 68) && !document.getElementById('home_button')) {
        ds++;
        if (ds >= 5) {
            ds = 0;
            ipcRenderer.send('debugging-show', 'show');
        }
    } else {
        ds = 0;
    }
});


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
