// This is what I need to be able to pull from the Gaze Interaction API
// that is built into the newest versions of Windows. I looked at using
// edge.js or NodeRT, but it seems like both of those execute the C#
// code on a separate thread, and the method call 
// GazeInputSourcePreview.GetForCurrentView must be called on the UI thread,
// so I suspect a native module is going to be the only way.
// 
// See https://docs.microsoft.com/en-us/windows/uwp/design/input/gaze-interactions
// for an example of using the API.

var gaze = require('gaze');

gaze.setup(function(status) {
  if(status.can_track_eyes && status.ready) {
    // ready!
    gaze.listen();
  } else if(status.calibration_needed || status.screen_setup_needed) {
    // calibraiton needed
  } else if(status.configuring) {
    // calibration in progress
  } else if(status.unknown) {
    // don't know what to say
  }
});
var check = function() {
  gaze.status(function(status) {
    console.log("last event at", status.moved_at);
    if(status.entered) {
      if(status.latest_point) {
        console.log("gaze event at", point.x, point.y, point.timestamp);
      }
    } else if(status.exited) {
      // not currently gazing, take note
    }
  });
};

var count = 0;
setInterval(function() {
  count++;
  if(count < 10) {
    check();
  } else {
    gaze.stop_listening();
  }
}, 500);
