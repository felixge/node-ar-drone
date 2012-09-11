var arDrone = exports;

var Client       = require('./lib/Client');
var ClientConfig = require('./lib/ClientConfig');

exports.PngStream    = require('./lib/video/PngStream');
exports.UdpControl    = require('./lib/control/UdpControl');

exports.createClient = function(options) {
  var client = new Client({config: new ClientConfig(options)});
  return client;
};

exports.createPngStream = function(options) {
  var stream = new arDrone.PngStream(options);
  stream.start();
  return stream;
};

exports.createUdpControl = function(options) {
  return new arDrone.UdpControl(options);
};
