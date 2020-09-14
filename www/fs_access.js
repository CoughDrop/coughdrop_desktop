var fs = window.fs_access;
var fs_path = window.fs_access;
var disk = window.fs_access;
var os = window.fs_access;
var process = window.fs_access;

var file_storage = {
  generate_entry: function (path, success, error, opts) {
    if (!path) { return error("no path specified"); }
    var basename = fs_path.basename(path);
    var res = {
      path: path,
      getDirectory: function(key, opts, success, error) {
        return file_storage.generate_entry(fs_path.resolve(res.path, key), function(e) {
          if(!e.isDirectory) { return error("not a directory"); }
          success(e);
        }, function(err) {
          error(err);
        }, {create_dir: opts && opts.create});
      },
      getFile: function(key, opts, success, error) {
        return file_storage.generate_entry(fs_path.resolve(res.path, key), function(e) {
          if(!e.isFile) { return error("not a file"); }
          success(e);
        }, function(err) {
          error(err);
        }, {create_file: opts && opts.create});
      },
      createReader: function() {
        return {
          readEntries: function(success, error) {
            if(res.isDirectory) {
              try {
                fs.readdir(res.path, function(err, list) {
                  if(err) { return error(err); }
                  var entries = [];
                  var next_entry = function () {
                    if (list.length === 0) {
                      return success(entries);
                    }
                    var entry_name = list.shift();
                    if (!entry_name) {
                      return next_entry();
                    }
                    file_storage.generate_entry(fs_path.resolve(res.path, entry_name), function(entry) {
                      entries.push(entry);
                      next_entry();
                    }, function(err) {
                      error(err);
                    });
                  };
                  next_entry();
                });
              } catch(e) {
                error(e);
              }
            } else {
              error("not a directory");
            }
          }
        }
      },
      toURL: function() {
        return "file:///" + encodeURI(res.path.replace(/\\/g, '/'));
      },
      createWriter: function(success, error) {
        var writer = {
          write: function(blob) {
            var arrayBuffer;
            var fileReader = new FileReader();
            fileReader.onload = function() {
              arrayBuffer = this.result;
              fs.writeFile(res.path, Buffer.from(arrayBuffer), function(err, write) {
                if(writer.onwriteend) {
                  writer.onwriteend();
                }
              });
            };
            fileReader.onerror = function(err) {
              error(err);
            };
            fileReader.readAsArrayBuffer(blob);
          }
        };
        success(writer); 
      },
      remove: function(success, error) {
        success();
      },
      name: basename,
      getMetadata: function(success, error) {
        fs.stat(res.path, function(err, stats) {
          if(err) { return error(err); }
          success({
            size: stats.size
          });
        });
      }
    };
    fs.stat(path, function(err, stats) {
      var file_success = function() {
        success(res);
      };
      if(err) { 
        if(opts && opts.create_dir) {
          fs.mkdir(res.path, function(err, status) {
            if(err) { return error(err); }
            res.isDirectory = true;
            res.isFile = false;
            res.size = 0;
            file_success();
          });
        } else if(opts && opts.create_file) {
          fs.writeFile(res.path, "", function(err, status) {
            if(err) { return error(err); }
            res.isDirectory = false;
            res.isFile = true;
            res.size = 0;
            file_success();
          });
        } else {
          return error(err); 
        }
      } else {
        res.isDirectory = stats.isDirectory();
        res.isFile = stats.isFile();
        res.size = stats.size;
        file_success();
      }
    });
  },
  root: function (success, error) {
    // to support packaged apps, this should use process.env.LOCALAPPDATA/coughdrop
    // so first check there, only use fallback if inaccessible
    var new_root = fs_path.resolve(process.env.LOCALAPPDATA, 'coughdrop');
    fs.stat(new_root, function(err, stat) {
      var local_is_ready = function() {
        var files_dir = fs_path.resolve(new_root, 'files');
        fs.mkdir(files_dir, {recursive: true}, function(err, res) {
          if(err && err.code != 'EEXIST') {
            if(error) { error(err); }
          } else {
            file_storage.generate_entry(files_dir, function(e) {
              if(success) { success(e); }
            }, function(err) {
              if(error) { error(err); }
            });
          }
        });
      };
      if(stat && stat.isDirectory()) {
        // try for appdata route first
        local_is_ready();
      } else {
        fs.mkdir(new_root, {recursive: true}, function(err, res) {
          if(err) {
            // fall back to old-school route
            var root = file_storage.old_school_root_path();
            if (!fs_path.basename(root).match(/coughdrop/) && !fs_path.basename(root).match(/cdb/)) {
              console.log("bad path: " + root);
            }
            if(root) {
              file_storage.generate_entry(fs_path.resolve(root, 'files'), function(e) {
                if (success) { success(e); }
              }, function(err) {
                if (error) { error(err); }
              }, { create_dir: true });
            } else {
              error("no root entry found");
            }
          } else {
            local_is_ready();
          }
        });
      }
    });
  },
  old_school_root_path: function() {
    var root = fs_path.dirname(process.execPath);
    if (fs_path.basename(root).match(/^app/)) {
      root = fs_path.dirname(root);
    }
    if (fs_path.basename(root).match(/^CoughDrop-/)) {
      root = fs_path.dirname(root);
    }
    if (!fs_path.basename(root).match(/coughdrop/)) {
      root = process.cwd();
      if (fs_path.basename(root).match(/^app/)) {
        root = fs_path.dirname(root);
      }
    }
    return root;
  },
  upgrade_voices: function(version, find_voice) {
    // currently unused. It turns out if you include the old
    // TTSNlp files in the /bin folder then it will support
    // legacy voice just fine.
    if(!window.extra_tts) {
      console.error("can't upgrade voices without extra_tts installed");
      return;
    }
    // if the current voice data is outdated or missing,
    // download and extract the newest /bin folder and
    // new voices to a temporary location, then when everything
    // is in place go ahead and copy to the correct location
    file_storage.voice_content(function(data) {
      var current_version = parseFloat(data.version.replace(/_/, '.'));
      if(!current_version || current_version < version) {
        var tmp_path = fs_path.resolve(process.env.LOCALAPPDATA, 'coughdrop', 'tmp_engine');
        // assert tmp_path
        var next_voice = function() {
          var voice_id = data.voices.shift();
          if(voice_id) {
            console.log("upgrading", voice_id);
            var voice = find_foice(voice_id);
            window.extra_tts.download_voice({
              voice_id: voice_id,
              base_dir: tmp_path,
              language_dir: voice.get('language_dir'),
              acapela_version: version,
              binary_url: voice.get('binary_url'),
              language_url: voice.get('language_url'),
              voice_url: voice.get('voice_url'),
              success: function() {
                console.log("done with", voice_id);
                next_voice();
              },
              error: function(err) { 
                console.error("error upgrading voice", err);
              }
            });
          } else {
            // move contents out of the tmp path into their new home
            // then call window.speecher.refresh_voices

            // xcopy src dest /e /y /i
            var dest = fs_path.resolve(process.env.LOCALAPPDATA, 'coughdrop');
            var child = cp.exec("xcopy /y /e /i \"" + tmp_path + "\" \"" + dest + "\"", function(err) {
              if (err) { console.log("error moving speech from " + tmp_path + " to " + dest); console.log(err); }
              if(window.speecher) {
                window.speecher.refresh_voices();
              }
              // done!
            });
          }
        };
        next_voice();
      }
    });
  },
  voice_content: function(success) {
    // return {
    //   version: '9_300',
    //   voices: []
    // };
    var new_dir = fs_path.resolve(process.env.LOCALAPPDATA, 'coughdrop');
    fs.stat(new_dir, function(err, stat) {
      if(!err && stat && stat.isDirectory()) {
        handle_dir(new_dir);
      } else {
        handle_dir(file_storage.old_school_root_path());
      }
    })
    // search for a bin and data folder
    // which should include a Selector2.conf file telling us the
    // version of the engine currently in use. If that version
    // doesn't match the expected version, we should run an
    // upgrade process
    var handle_dir = function(coughdrop_dir) {
      console.log("handle", coughdrop_dir);
      fs.stat(fs_path.resolve(coughdrop_dir, 'bin'), function(err, stat) {
        if(stat && stat.isDirectory()) {
          fs.readFile(fs_path.resolve(coughdrop_dir, 'bin', 'Selector2.conf'), 'utf8', function(err, data) {
            console.log(data);
            var version = data.match(/Version=([\d_]+)/)[1];
            version = version.split(/_/).slice(0, 1).join('_');
            fs.readdir(fs_path.resolve(coughdrop_dir, 'data'), function(err, list) {
              list = list || [];
              var names = [];
              var next_dir = function() {
                var lang = list.shift();
                if(lang) {
                  fs.stat(fs_path.resolve(coughdrop_dir, 'data', lang), function(err, stat) {
                    if(stat.isDirectory()) {
                      fs.readdir(fs_path.resolve(coughdrop_dir, 'data', lang), function(err, list) {
                        list.forEach(function(voice) {
                          if(voice.match(/22k/)) {
                            names.push('acap:' + voice.split(/22k/)[0]);
                          }
                        });
                        next_dir();
                      });
                    } else {
                      next_dir();
                    }
                  });
                } else {
                  var res = {
                    version: version,
                    voices: names
                  };
                  console.log(res);
                  success(res);
                }
              };
              next_dir();
            });
          });
        }
      });
    };
  },
  free_space: function() {
    let path = os.platform() === 'win32' ? 'c:' : '/';
    disk.check(path).then(function(info) {
      // info.available
      var num = info.available;
      return {
        free: num,
        mb: Math.round(num / 1024 / 1024),
        gb: Math.round(num * 100 / 1024 / 1024 / 1024) / 100
      };
    });
  }
};
window.file_storage = file_storage;
// root(success, error)
// root: createReader(), getDirectory(key, opts, callback, error) 
// reader: readEntries(callback), 
// directory(entry?): getDirectory(key, opts, callback), getFile(filename, opts, callback, error)
// file: toURL(), createWriter(callback), remove(callback, error)
// entry: isDirectory, isFile, name, getMetadata, 
// metadata: size
// writer: onwriteend(), onerror(err), write(blob)