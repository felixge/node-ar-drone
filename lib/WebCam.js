var http = require('http');

module.exports = WebCam;
function WebCam(options) {
  this._server = null;
  this._port   = options.port;
  this._source = options.source;
  this._image  = null;
}

WebCam.prototype.start = function(cb) {
  this._server = http.createServer(this._handleRequest.bind(this));
  this._server.listen(this._port, cb);
  this._source.on('data', this._handleImage.bind(this));
};

WebCam.prototype._handleImage = function(buffer) {
  this._image = buffer;
};

WebCam.prototype._handleRequest = function(req, res) {
  switch (req.url) {
    case '/':
      res.setHeader('Refresh', '0');
      if (!this._image) {
        res.setHeader('Content-Type', 'text/plain');
        res.end('No data yet');
        return;
      }

      res.setHeader('Content-Type', 'image/png');
      res.end(this._image);
      break;
    default:
      res.writeHead(404);
      res.end('404');
  }
};
