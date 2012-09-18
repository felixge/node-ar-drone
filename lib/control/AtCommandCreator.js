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

// The pcmd option aliases and the argument index they belong to
var aliases = {
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

  var args = [0, 0, 0, 0, 0];

  for (var key in options) {
    var alias = aliases[key];
    var value = options[key];

    if (alias.invert) {
      value = -value;
    }

    args[alias.index] = value;
  }

  for (var i = 1; i < args.length; i++) {
    args[i] = at.floatString(args[i]);
  }

  //flags = flags | (1 << 0);

  return this.raw('PCMD', args);
};
