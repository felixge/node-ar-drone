// Converts a video stream into a stream of png buffers. Each 'data' event
// is guaranteed to contain exactly 1 png image.

// @TODO Figure out why ffmpeg.stdin.write seems to always return false and
// never emits 'drain' event (so we can get backpressure working)
// @TODO handle ffmpeg exit (and trigger "error" if unexpected)

var Stream      = require('stream').Stream;
var util        = require('util');
var spawn       = require('child_process').spawn;
var PngSplitter = require('../PngSplitter');

module.exports = PngEncoder;
util.inherits(PngEncoder, Stream);
function PngEncoder(options) {
  Stream.call(this);

  options = options || {};

  this.writable = true;
  this.readable = true;

  this._spawn       = options.spawn || spawn;
  this._frameRate   = options.frameRate || 5;
  this._pngSplitter = options.pngSplitter || new PngSplitter();
  this._log         = options.log;
  this._ffmpeg      = undefined;
}

PngEncoder.prototype.write = function(buffer) {
  if (!this._ffmpeg) {
    this._initFfmpegAndPipes();
  }

  this._ffmpeg.stdin.write(buffer);
};

PngEncoder.prototype._initFfmpegAndPipes = function() {
  this._ffmpeg = this._spawnFfmpeg();

  if (this._log) {
    this._ffmpeg.stderr.pipe(this._log);
  }

  this._ffmpeg.stdout.pipe(this._pngSplitter);
  this._pngSplitter.on('data', this.emit.bind(this, 'data'));
};

PngEncoder.prototype._spawnFfmpeg = function() {
  return this._spawn('ffmpeg', [
    '-i' ,'-',
    '-f', 'image2pipe',
    '-vcodec', 'png',
    '-r', this._frameRate,
    '-',
  ]);
};

PngEncoder.prototype.end = function() {
  this._ffmpeg.stdin.end();
};
