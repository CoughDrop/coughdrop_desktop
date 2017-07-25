var fs = requireNode('fs');
var fs_path = requireNode('path');

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