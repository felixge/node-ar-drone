var AtCommand = require('./AtCommand');
var at        = require('./at');

module.exports = AtCommandCreator;
function AtCommandCreator() {
  this._number   = 0;
}


AtCommandCreator.prototype.raw = function(type, args) {
  args = (Array.isArray(args))
    ? args
    : Array.prototype.slice.call(arguments, 1);

  return new AtCommand(type, this._number++, args);
};

AtCommandCreator.REF_FLAGS = {
  emergency : (1 << 8),
  fly       : (1 << 9),
};

// Used for fly/land as well as emergency trigger/recover
AtCommandCreator.prototype.ref = function(options) {
  options = options || {};

  var args = [0];
  for (var key in options) {
    args[0] = args[0] | AtCommandCreator.REF_FLAGS[key];
  }

  return this.raw('REF', args);
};

AtCommandCreator.PCMD_FLAGS = {
  progressive : (1 << 0),
};

AtCommandCreator.PCMD_ALIASES = {
  left             : {index: 1, invert: true},
  right            : {index: 1, invert: false},
  front            : {index: 2, invert: true},
  back             : {index: 2, invert: false},
  up               : {index: 3, invert: false},
  down             : {index: 3, invert: true},
  clockwise        : {index: 4, invert: false},
  counterclockwise : {index: 4, invert: true},
};

// Used to fly the drone around
AtCommandCreator.prototype.pcmd = function(options) {
  options = options || {};

  // flags, leftRight, frontBack, upDown, clockWise
  var args = [0, 0, 0, 0, 0];

  for (var key in options) {
    var alias = AtCommandCreator.PCMD_ALIASES[key];
    var value = options[key];

    if (alias.invert) {
      value = -value;
    }

    args[alias.index] = value;
    args[0]           = args[0] | AtCommandCreator.PCMD_FLAGS.progressive;
  }

  for (var i = 1; i < args.length; i++) {
    args[i] = at.floatString(args[i]);
  }


  return this.raw('PCMD', args);
};
