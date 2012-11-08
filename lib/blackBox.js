var createDirectory = require('./blackBox/createDirectory');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var fs = require('fs');
var os = require('os');
var spawn = require('child_process').spawn;
var _ = require('underscore');
var packageJson = require('../package.json');
var flattenObject = require('./blackBox/flattenObject');

var exports = module.exports = function createBlackbox(options) {
  return new Blackbox(options);
};

exports.Blackbox = Blackbox;
util.inherits(Blackbox, EventEmitter);
function Blackbox(options) {
  this.config = options.config;
  this.log = options.log;
  this.navdata = options.navdata;
  this.path = null;
  this.logFile = null;;
  this.navdataFile = null;;
}

Blackbox.prototype.resume = function() {
  var self = this;
  createDirectory(self.config.blackBoxDir, function(err, path) {
    if (!err) {
      self.path = path;
      self.start();
      self.log.write('blackBox: recording to "' + path + '" ...');
    } else {
      self.log.write('blackBox: error starting recording: ' + err.stack);
    }

    self.emit('ready');
  });
};

Blackbox.prototype.start = function() {
  this.writeEnv();
  this.writeFfmpeg();
  this.writeLog();
  this.writeNavdata();
};

Blackbox.prototype.writeEnv = function() {
  var env = {};
  env.config = this.config;
  env.argv = process.argv;
  env.versions = _.extend({arDrone: packageJson.version}, process.versions);
  env.configure = process.config;

  env.os = {};
  for (var key in os) {
    // deprecated
    if (key === 'getNetworkInterfaces') {
      continue;
    }

    var value = os[key];
    env.os[key] = (typeof value === 'function')
      ? os[key]()
      : value;
  }

  env.os.PATH = process.env.PATH;

  this._writeJsonFile('env.json', env);
};

Blackbox.prototype.writeFfmpeg = function() {
  var codecs = spawn(this.config.ffmpeg, ['-codecs']);
  var codecsFile = fs.createWriteStream(this.path + '/ffmpeg.codecs.txt');
  codecs.stdout.pipe(codecsFile);
  codecs.stderr.pipe(codecsFile);

  var formats = spawn(this.config.ffmpeg, ['-formats']);
  var formatsFile = fs.createWriteStream(this.path + '/ffmpeg.formats.txt');
  formats.stdout.pipe(formatsFile);
  formats.stderr.pipe(formatsFile);
};

Blackbox.prototype.writeLog = function() {
  this.logFile = fs.createWriteStream(this.path + '/log.txt');
  this.log.pipe(this.logFile);
};

Blackbox.prototype.writeNavdata = function() {
  this.navdataFile = fs.createWriteStream(this.path + '/navdata.tsv');

  var self = this;
  var first = true;
  this.navdata.on('data', function(data) {
    data = flattenObject(data);

    if (first) {
      var header = Object.keys(data);
      self.navdataFile.write(header.join('\t') + '\n');
      first = false;
    }

    self.navdataFile.write(_.values(data).join('\t') + '\n');
  });
};

Blackbox.prototype._writeJsonFile = function(name, json) {
  var path = this.path + '/' + name;
  var prettyJSON = JSON.stringify(json, null, 2);

  var self = this;
  fs.writeFile(path, prettyJSON, function(err) {
    if (err) {
      self.log.write('blackBox: Could not write JSON file: ' + err.stack);
    }
  });
};
