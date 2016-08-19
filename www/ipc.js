var eye_gaze = requireNode('../node_modules/gazelinger/electron-listener.js');
if(window.capabilities) {
  window.capabilities.eye_gaze.listen = eye_gaze.listen;
  window.capabilities.eye_gaze.stop_listening = eye_gaze.stop_listening;
  window.capabilities.eye_gaze.available = true;
}

// const ipcRenderer = requireNode('electron').ipcRenderer;
// 
// var poll = null;
// var poll_callback = null;
// var elem = document.createElement('div');
// elem.style.position = 'absolute';
// elem.style.top = '-100px';
// elem.style.left = '-100px';
// elem.style.width = '50px';
// elem.style.height = '50px';
// elem.style.borderRadius = '20px';
// elem.style.backgroundColor = '#f00';
// elem.style.opacity = 0.3;
// elem.style.zIndex = 99999;
// elem.innerHTML = "asdf";
// elem.id = 'bacon';
// var ratio = window.devicePixelRatio || 1.0;
// var last_linger_ts = null;
// var last_gaze_ts = null;
// var gaze_history = [];
// setTimeout(function () {
// 
//     document.body.appendChild(elem);
// 
// }, 2000);
// ipcRenderer.on('eye-gaze-data', function(event, arg) {
//     // TODO: do some intelligent parsing in here, standardize what get sent back
//     // so it'll work across multiple eye tracking systems.
//       var data = JSON.parse(arg);
//       var message = { raw: data };
//       message.ts = (new Date()).getTime();
// 
//       var elem = document.getElementById('linger');
// 
//       var elem_left = elem && elem.style.left;
// 
//       if (data.end_ts && data.begin_ts && data.end_ts > data.begin_ts && data.end_ts != last_linger_ts) {
// 
//           console.log("linger duration " + (data.end_ts - data.begin_ts));
// 
//           console.log("time since last " + (data.end_ts - last_linger_ts));
// 
//           last_linger_ts = data.end_ts;
// 
//           message.x = (data.data_x / ratio) - (window.screenInnerOffsetX || window.screenX);
// 
//           message.y = (data.data_y / ratio) - (window.screenInnerOffsetY || window.screenY);
// 
//           message.duration = (data.end_ts - data.begin_ts);
// 
//           message.type = 'linger';
// 
// //          elem.style.top = message.y + "px";
// 
// //          elem.style.left = message.x + "px";
// 
//           var e = Ember.$.Event('gazelinger');
// 
//           e.clientX = message.x;
// 
//           e.clientY = message.y;
// 
//           e.duration = message.duration;
// 
// //          elem.style.display = 'none';
// 
//           if (elem) { elem.style.left = '-1000px'; }
// 
//           e.target = document.elementFromPoint(message.x, message.y);
// 
//           if (elem) { elem.style.left = elem_left; }
// 
// //          Ember.$(e.target).trigger(e);
// 
// //          elem.style.display = 'block';
// 
//       }
//       if (data.gaze_ts && data.gaze_ts != last_gaze_ts) {
//           last_gaze_ts = data.gaze_ts;
//           message.x = (data.gaze_x / ratio) - (window.screenInnerOffsetX || window.screenX);
// 
//           message.y = (data.gaze_y / ratio) - (window.screenInnerOffsetY || window.screenY);
// 
//           message.type = 'over';
// 
//           message.ts = data.gaze_ts;
// 
//           gaze_history.push({
// 
//               x: message.x,
// 
//               y: message.y,
// 
//               ts: message.ts
// 
//           });
//           // prune based on distance from latest timestamp
//           var new_history = [];
//           gaze_history.forEach(function (e) { if (last_gaze_ts - e.ts < 200) { new_history.push(e); } });
//           gaze_history = new_history;
//           // find a quick median
//           var xs = gaze_history.sort(function (a, b) { return b.x - a.x });
//           var midx = xs[Math.ceil(xs.length / 2)];
//           var ys = gaze_history.sort(function (a, b) { return b.y - a.y });
//           var midy = ys[Math.ceil(ys.length / 2)];
//           // temporarily remove outliers
//           if (midx && midy) {
// 
//               midx = midx.x;
// 
//               midy = midy.y;
// 
//               console.log(midx + ", " + midy);
// 
//               console.log(gaze_history);
// 
//               var filtered_history = gaze_history.filter(function (e) { return (Math.abs(e.x - midx) < 50) && (Math.abs(e.y - midy) < 50); });
// 
//               if (filtered_history.length > 0) {
// 
//                   console.log(filtered_history);
// 
//                   var biggest_dist = 0;
// 
//                   last_history_ts = gaze_history[0].ts;
// 
//                   filtered_history.forEach(function (e) { biggest_dist = Math.max(biggest_dist, e.ts - last_history_ts); last_history_ts - e.ts; });
// 
//                   // if there are no significant time gaps, compute a new middle and trigger a linger event
//                   console.log(biggest_dist);
//                   if (biggest_dist <= 50) {
// 
//                       var mean_x = 0;
// 
//                       var mean_y = 0;
// 
//                       filtered_history.forEach(function (e) { mean_x = mean_x + e.x; mean_y = mean_y + e.y; });
// 
//                       mean_x = mean_x / filtered_history.length;
// 
//                       mean_y = mean_y / filtered_history.length;
// 
//                       var e = Ember.$.Event('gazelinger');
// 
//                       e.clientX = mean_x;
// 
//                       e.clientY = mean_y;
// 
//                       e.duration = filtered_history[filtered_history.length - 1].ts - filtered_history[0].ts;
// 
//                       if (elem) { elem.style.left = '-1000px'; }
// 
//                       e.target = document.elementFromPoint(message.x, message.y);
// 
//                       if (elem) { elem.style.left = elem_left; }
// 
//                       Ember.$(e.target).trigger(e);
// 
//                       gaze_history = gaze_history.slice(4, 50);
// 
//                   }
// 
//               }
//           }
//           var e = Ember.$.Event('gazeover');
// 
//           e.clientX = message.x;
// 
//           e.clientY = message.y;
// 
//           if (elem) { elem.style.left = '-1000px'; }
// 
//           e.target = document.elementFromPoint(message.x, message.y);
// 
//           if (elem) { elem.style.left = elem_left; }
// 
// //          Ember.$(e.target).trigger(e);
// 
//       }
//       if (poll_callback) {
// 
//           poll_callback(message);
//       }
// });
// window.capabilities.eye_gaze.listen = function(callback) {
//   if(poll) {
//     window.clearInterval(poll);
//   }
//   poll = window.setInterval(function () {
// 
//       ipcRenderer.send('eye-gaze-ping');
// 
//   }, 20);
//   poll_callback = callback;
// };
// window.capabilities.eye_gaze.stop_listening = function() {
//   if(poll) {
//     window.clearInterval(poll);
//   }
// };
// window.capabilities.eye_gaze.available = true;