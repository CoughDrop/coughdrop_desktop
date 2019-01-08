var ipcRenderer = requireNode('electron').ipcRenderer;

try {
    var path = 'gazelinger/electron-listener.js';
    var eye_gaze = requireNode(path);
    var fs_path = requireNode('path');
    if (window.capabilities) {
        // listen should be idempotent, we don't actually
        // care how many times we subscribe to it because
        // events happens through a different channel, so
        // we just need to tell it to broadcast at least once.
        // listen() is getting called on every board change,
        // so let's definitely not queue up a ton of extra events.
        window.capabilities.eye_gaze.listen = function() {
            if(!window.capabilities.eye_gaze.listening) {
                window.capabilities.eye_gaze.listening = true;
                return eye_gaze.listen();
            } else { return true; }
        };
        window.capabilities.eye_gaze.stop_listening = function() {
            window.capabilities.eye_gaze.listening = false;
            return eye_gaze.stop_listening();
        };
        window.capabilities.eye_gaze.calibrate = eye_gaze.calibrate;
        window.capabilities.eye_gaze.calibratable = eye_gaze.calibratable;
        window.capabilities.eye_gaze.available = true;
    }
} catch (e) { }

try {
    var tts_path = 'acapela/extra-tts-ipc.js';
    var tts = requireNode(tts_path);
    if (window.capabilities) {
        tts.reload = tts.reload || function () { };
        tts.base_dir = fs_path.resolve(process.env.LOCALAPPDATA, 'coughdrop');
        window.extra_tts = tts;
        window.capabilities.tts.extra_exec = tts.exec;
        window.capabilities.debugging = {
            available: function () { return true; },
            show: function () {
                ipcRenderer.send('debugging-show', 'show');
            }
        };
    }
} catch (e) { debugger }

try {
    var tts = requireNode('sapi_tts/tts.js');
    if(tts && tts.enabled) {
        window.TTS = tts;
    }    
} catch(e) { }

var ds = 0;
document.addEventListener('keypress', function (e) {
    if (e.target.tagName != 'INPUT' && e.target.tagName != 'TEXTAREA') {
        if(e.keyCode == 100 || e.keyCode == 68) {
            if(ds <= 5) {
                ds++;
            }
            if (ds >= 5 && !document.getElementById('home_button')) {
                ds = 0;
                ipcRenderer.send('debugging-show', 'show');
            }
        } else if(ds >= 5 && (e.keyCode == 98 || e.keyCode == 66)) {
            if(document.getElementById('home_button')) {
                ds++;
                if(ds >= 10) {
                    ds = 0;
                    ipcRenderer.send('debugging-show', 'show');
                }
            }
        } else {
            ds = 0;
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
