var fs = require('fs');
var async = require('async');

var exports = module.exports = function createDirectory(baseDir, cb) {
  async.waterfall([
    function createBaseDir(next) {
      fs.mkdir(baseDir, function(err) {
        // ignore errors, we'll assume the baseDir already existed
        next(null);
      });
    },
    function lsBaseDir(next) {
      fs.readdir(baseDir, next);
    },
    function determineSubDir(files, next) {
      files = files
        .filter(function isNumeric(file) {
          return /^\d+$/.test(file);
        })
        .map(function toInt(file) {
          return parseInt(file, 10);
        })
        .sort(function highestFirst(a, b) {
          if (a === b) {
            return 0;
          }

          return (a > b)
            ? -1
            : 1;
        });

      var number = (files.length)
          ? files[0] + 1
          : 0;

      next(null, baseDir + '/' + number);
    },
    function createSubDir(subDir) {
      fs.mkdir(subDir, function(err) {
        cb(err, subDir);
      });
    }
  ], cb);
};
