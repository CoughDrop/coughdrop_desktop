var path = '../node_modules/gazelinger/electron-listener.js';
var tts_path = '../node_modules/acapela/extra-tts-ipc.js';
if(location.pathname) {
  path = location.pathname.replace(/^\//, '').replace(/www\/desktop_index\.html.*$/, 'node_modules/gazelinger/electron-listener.js');
  tts_path = location.pathname.replace(/^\//, '').replace(/www\/desktop_index\.html.*$/, 'node_modules/acapela/extra-tts.js');
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
}
coughDropExtras.advance('device');