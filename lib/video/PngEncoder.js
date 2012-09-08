var Stream = require('stream').Stream;
var util   = require('util');

module.exports = PngEncoder;
util.inherits(PngEncoder, Stream);
function PngEncoder(options) {
  Stream.call(this);

  options = options || {};

  this.writable = true;
  this.readable = true;

  this._spawn       = options.spawn;
  this._frameRate   = options.frameRate || 5;
  this._pngSplitter = options.pngSplitter;
  this._ffmpeg      = undefined;
}

PngEncoder.prototype.write = function(buffer) {
  if (!this._ffmpeg) {
    this._ffmpeg = this._spawnFfmpeg();
    this._ffmpeg.stdout.pipe(this._pngSplitter);
    this._pngSplitter.on('data', this.emit.bind(this, 'data'));
  }

  return this._ffmpeg.stdin.write(buffer);
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
