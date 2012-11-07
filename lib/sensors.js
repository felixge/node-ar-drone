var util = require('util');
var Stream = require('stream').Stream;
var Data = require('./sensors/data').Data;

module.exports = function createSensors() {
  return new Sensors();
};

module.exports.Sensors = Sensors;
util.inherits(Sensors, Stream);
function Sensors() {
  Data.call(this);
  Stream.call(this);

  this.readable = true;
}
