var _ = require('underscore');
module.exports = function createClientControl(options) {
  // @TODO: create udpControl if none is provided
  options = _.defaults(options || {}, {});

  return new ClientControl(options);
};

module.exports.ClientControl = ClientControl;
function ClientControl(options) {
  this.upDown    = 0;
  this.leftRight = 0;
  this.frontBack = 0;
  this.upDown    = 0;
  this.clockSpin = 0;

  this._udpControl = options.udpControl;
}

ClientControl.prototype.toJSON = function() {
  var self = this;
  return Object.keys(this).reduce(function(json, key) {
    json[key] = self[key];
    return json
  }, {});
};
