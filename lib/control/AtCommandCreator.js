var AtCommand = require('./AtCommand');
var at        = require('./at');

module.exports = AtCommandCreator;
function AtCommandCreator() {
  this._number   = 0;
}

// Used for takeoff/land as well as emergency trigger/recover
AtCommandCreator.prototype.ref = function(options) {
  options = options || {};

  var flags = 0;

  if (options.takeoff) {
    flags = flags | (1 << 9);
  }

  if (options.emergency) {
    flags = flags | (1 << 8);
  }

  return this._createCommand('REF', [flags]);
};

// Used to fly the drone around
AtCommandCreator.prototype.pcmd = function(options) {
  options = options || {};

  var flag = 0;
  if (options.upDown || options.leftRight || options.frontBack || options.clockWise) {
    // set progressive commands bit
    flag = flag | (1 << 0);
  }

  var args = [
    flag,
    at.floatString(options.leftRight || 0),
    at.floatString(options.frontBack || 0),
    at.floatString(options.upDown || 0),
    at.floatString(options.clockWise || 0),
  ];

  return this._createCommand('PCMD', args);
};

AtCommandCreator.prototype._createCommand = function(type, args) {
  var command = new AtCommand(type, this._number++, args);
  return command;
};
