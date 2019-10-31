var ipcRenderer = requireNode('electron').ipcRenderer;

(function() {
  window.time_log = function (str) {
    var stamp = Math.round(new Date().getTime() / 1000 % 100 * 100) / 100;
    console.log(str + "  :" + stamp);
  };
  
  time_log("init started");

  // hacky fix for fixed position keyboard bug in ios
  window.scrollTo(document.body.scrollLeft, document.body.scrollTop);
  
  if(window.navigator.splashscreen) {
    window.navigator.splashscreen.show();
  }
  
  window.load_state = window.load_state || {};
  window.load_state.state = "init";
  window.load_state.init = true;

  window.shouldRotateToOrientation = function(degrees) {
   return true;
  };
  
  function loadingSay(html) {
    var message = document.getElementById('loading_message');
    if(message) {
      message.style.display = 'block';
      message.innerHTML = html;
    }
  }
  function hideSplash() {
    window.splash_hidden = true;
  }
  function checkState() {
    time_log("COUGHDROP: checking state...");
    window.load_state = window.load_state || {};
    if(!window.FileReader) {
      hideSplash();
      loadingSay("your device's built-in web browser appears out of date and will not work with CoughDrop, <a href='http://www.whatbrowser.org' target='_blank'>you should consider upgrading</a>.");
    } else if(!window.load_state.js_retrieved) {
      if(!window.load_state.js_still_waiting) {
        window.load_state.js_still_waiting = true;
        loadingSay("downloading resources, this may take a little while...");
        setTimeout(checkState, 5000);
      } else if(!window.load_state.js_really_still_waiting) {
        window._trackJs && window._trackJs.track("slow download");
        window.load_state.js_really_still_waiting = true;
        loadingSay("still downloading. It doesn't usually take this long, there may be a slow connection...");
        setTimeout(checkState, 60000);
      } else {
        window._trackJs && window._trackJs.track("download failed");
        if(window.capabilities && window.capabilities.db_error) {
          hideSplash();
          loadingSay("there might be a problem with your installation. You can try deleting and re-installing the app, keep waiting, or <a href='https://coughdrop.zendesk.com' target='_blank'>contact support</a>");
        } else {
          hideSplash();
          loadingSay("looks like there might be a problem. You can keep waiting or <a href='https://coughdrop.zendesk.com' target='_blank'>contact support</a>");
          ipcRenderer.send('debugging-show', 'show');
        }
      }
    } else if(!window.load_state.js_loaded) {
      if(!window.load_state.js_still_loading) {
        window.load_state.js_still_loading = true;
        loadingSay("initializing...");
        setTimeout(checkState, 5000);
      } else if(!window.load_state.js_really_still_loading) {
        window._trackJs && window._trackJs.track("slow init");
        window.load_state.js_really_still_loading = true;
        hideSplash();
        loadingSay("initialization is taking longer than expected...");
        setTimeout(checkState, 30000);
      } else {
        window._trackJs && window._trackJs.track("init failed");
        if(window.capabilities && window.capabilities.db_error) {
          hideSplash();
          loadingSay("there might be a problem with your installation. You can try deleting and re-installing the app, keep waiting, or <a href='https://coughdrop.zendesk.com' target='_blank'>contact support</a>");
        } else {
          hideSplash();
          loadingSay("something appears to be broken. You can keep waiting or <a href='https://coughdrop.zendesk.com' target='_blank'>contact support</a>.");
          ipcRenderer.send('debugging-show', 'show');
        }
      }
    }
  }
  setTimeout(checkState, 500);
  setTimeout(function() {
    if(!window.splash_hidden) {
      console.error("splash screen wasn't hidden");
      window._trackJs && window._trackJs.track("splash screen wasn't hidden");
    }
  }, 30000);
  window.app_version = "2019.10.31a";
  window.capabilities = {installed_app: true, api_host: "https://app.mycoughdrop.com", wait_for_deviceready: true};
  navigator.standalone = navigator.standalone || (navigator.userAgent.match(/android/i) && navigator.userAgent.match(/chrome/i) && (screen.height-document.documentElement.clientHeight<40));
  var elem = document.getElementById('enabled_frontend_features');
  window.enabled_frontend_features = [];
  if(elem && elem.getAttribute) {
    window.enabled_frontend_features = (elem.getAttribute('data-list') || "").split(/,/);
  }
  ipcRenderer.send('status-ready', 'loading');
})();
