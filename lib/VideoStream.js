var net         = require('net');
var Stream      = require('stream').Stream;
var util        = require('util');
var spawn       = require('child_process').spawn;
var PngSplitter = require('./PngSplitter');

module.exports = VideoStream;
util.inherits(VideoStream, Stream);
function VideoStream(options) {
  Stream.call(this);

  this.readable     = true;
  this._ip          = options.ip;
  this._port        = options.port;
  this._socket      = null;
  this._ffmpeg      = null;
  this._pngSplitter = new PngSplitter();
}

VideoStream.prototype.start = function() {
  this._socket = net.createConnection(this._port, this._ip);
  this._ffmpeg = spawn('ffmpeg', ['-i' ,'-', '-f', 'image2pipe', '-vcodec', 'png', '-r', '10', '-']);

  this._socket.pipe(this._ffmpeg.stdin);
  this._ffmpeg.stderr.pipe(process.stderr);
  this._ffmpeg.stdout.pipe(this._pngSplitter);

  var self = this;
  this._pngSplitter.on('png', function(buffer) {
    self.emit('png', buffer);
  });
};
