var arDrone = exports;

exports.Client           = require('./lib/Client');
exports.UdpControl       = require('./lib/control/UdpControl');
exports.PngStream        = require('./lib/video/PngStream');
exports.UdpNavdataStream = require('./lib/navdata/UdpNavdataStream');

exports.createClient = function(options) {
  var client = new arDrone.Client(options);
  client.resume();
  return client;
};

exports.createUdpControl = function(options) {
  return new arDrone.UdpControl(options);
};

exports.createPngStream = function(options) {
  var stream = new arDrone.PngStream(options);
  stream.resume();
  return stream;
};

exports.createUdpNavdataStream = function(options) {
  var stream = new arDrone.UdpNavdataStream(options);
  stream.resume();
  return stream;
};
