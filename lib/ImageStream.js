var net         = require('net');
var Stream      = require('stream').Stream;
var util        = require('util');
var spawn       = require('child_process').spawn;
var PngSplitter = require('./PngSplitter');
var WebCam      = require('./WebCam');
var Tracker     = require('./Tracker');

module.exports = ImageStream;
util.inherits(ImageStream, Stream);
function ImageStream(options) {
  Stream.call(this);

  this.readable     = true;
  this._videoStream = options.videoStream;
  this._debug       = Boolean(options.debug);
  this._fps         = options.fps || 5;
  this._format      = 'png'; // @TODO support jpeg as well
  this._ffmpeg      = null;
  this._pngSplitter = null;
}

ImageStream.prototype.start = function() {
  var args = [
    '-i' ,'-',
    '-f', 'image2pipe',
    '-vcodec', this._format,
    '-r', this._fps,
    '-',
  ];

  this._ffmpeg      = spawn('ffmpeg', args);
  this._pngSplitter = new PngSplitter();

  this._videoStream.pipe(this._ffmpeg.stdin);
  this._ffmpeg.stdout.pipe(this._pngSplitter);

  if (this._debug) {
    this._ffmpeg.stderr.pipe(process.stderr);
  }

  var self = this;
  this._pngSplitter.on('png', function(buffer) {
    self.emit('data', buffer);
  });
};

ImageStream.prototype.webCam = function(options) {
  options        = Object.create(options);
  options.source = this;

  var stream = new WebCam(options);
  stream.start();
  return stream;
};

ImageStream.prototype.tracker = function(options) {
  options        = Object.create(options || {});
  options.source = this;

  var tracker = new Tracker(options);
  tracker.start();
  return tracker;
};
