var TcpVideoStream = require('./TcpVideoStream');
var PngSplitter    = require('../PngSplitter');
var spawn          = require('child_process').spawn;
var Stream         = require('stream').Stream;
var util           = require('util');

module.exports = PngStream;
util.inherits(PngStream, Stream);
function PngStream(options) {
  Stream.call(this);

  options = options || {};

  this._fps = options.fps || 5;
}

PngStream.prototype.start = function() {
  var args = [
    '-i' ,'-',
    '-f', 'image2pipe',
    '-vcodec', 'png',
    '-r', this._fps,
    '-',
  ];

  this._ffmpeg      = spawn('ffmpeg', args);
  this._videoStream = new TcpVideoStream();
  this._pngSplitter = new PngSplitter();

  this._videoStream.pipe(this._ffmpeg.stdin);
  this._ffmpeg.stdout.pipe(this._pngSplitter);
  //this._ffmpeg.stderr.pipe(process.stderr);

  var self = this;
  this._pngSplitter.on('png', function(buffer) {
    self.emit('data', buffer);
  });

  this._videoStream.connect();
};
