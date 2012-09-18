var AtCommand = require('./AtCommand');
var at        = require('./at');

module.exports = AtCommandCreator;
function AtCommandCreator() {
  this._number   = 0;
}

AtCommandCreator.prototype.raw = function(type) {
  var args = Array.prototype.slice.call(arguments, 1);
  return new AtCommand(type, this._number++, args);
};

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

  return this.raw('REF', flags);
};

// Used to fly the drone around
AtCommandCreator.prototype.pcmd = function(options) {
  options = options || {};

  var flags = 0;
  if (options.upDown || options.leftRight || options.frontBack || options.clockWise) {
    // set progressive commands bit
    flags = flags | (1 << 0);
  }

  return this.raw(
    'PCMD',
    flags,
    at.floatString(options.leftRight || 0),
    at.floatString(options.frontBack || 0),
    at.floatString(options.upDown || 0),
    at.floatString(options.clockWise || 0)
  );
};
