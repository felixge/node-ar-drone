var AtCommand = require('./AtCommand');
var at        = require('./at');

var exports = module.exports = AtCommandCreator;
function AtCommandCreator() {
  this._number   = 0;
}

AtCommandCreator.prototype.raw = function(type, args) {
  args = (Array.isArray(args))
    ? args
    : Array.prototype.slice.call(arguments, 1);

  return new AtCommand(type, this._number++, args);
};

// Used for fly/land as well as emergency trigger/recover
AtCommandCreator.prototype.ref = function(options) {
  options = options || {};

  var args = [0];

  if (options.fly) {
    args[0] = args[0] | REF_FLAGS.takeoff;
  }

  if (options.emergency) {
    args[0] = args[0] | REF_FLAGS.emergency;
  }

  return this.raw('REF', args);
};

// Used to fly the drone around
AtCommandCreator.prototype.pcmd = function(options) {
  options = options || {};

  // flags, leftRight, frontBack, upDown, clockWise
  var args = [0, 0, 0, 0, 0];

  for (var key in options) {
    var alias = PCMD_ALIASES[key];
    var value = options[key];

    if (alias.invert) {
      value = -value;
    }

    args[alias.index] = at.floatString(value);
    args[0]           = args[0] | PCMD_FLAGS.progressive;
  }

  return this.raw('PCMD', args);
};

AtCommandCreator.prototype.config = function(name, value) {
  return this.raw('CONFIG', '"' + name + '"', '"' + value + '"');
};

// Constants

var REF_FLAGS = exports.REF_FLAGS = {
  emergency : (1 << 8),
  takeoff   : (1 << 9),
};

var PCMD_FLAGS = exports.PCMD_FLAGS = {
  progressive : (1 << 0),
};

var PCMD_ALIASES = exports.PCMD_ALIASES = {
  left             : {index: 1, invert: true},
  right            : {index: 1, invert: false},
  front            : {index: 2, invert: true},
  back             : {index: 2, invert: false},
  up               : {index: 3, invert: false},
  down             : {index: 3, invert: true},
  clockwise        : {index: 4, invert: false},
  counterClockwise : {index: 4, invert: true},
};
