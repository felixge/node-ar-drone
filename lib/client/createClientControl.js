var createAtMessage    = require('../control/createAtMessage');
var createAtRefCommand = require('../control/commands/createAtRefCommand');

module.exports = function createClientControl(options) {
  return new ClientControl(options);
};

module.exports.ClientControl = ClientControl;
function ClientControl(options) {
  this.fly       = false;
  this.emergency = false;
  this.upDown    = 0;
  this.leftRight = 0;
  this.frontBack = 0;
  this.upDown    = 0;
  this.clockSpin = 0;
}

ClientControl.prototype.toJSON = function() {
  var self = this;
  return Object.keys(this).reduce(function(json, key) {
    json[key] = self[key];
    return json
  }, {});
};
