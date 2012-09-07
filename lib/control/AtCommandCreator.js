var AtCommand = require('./AtCommand');

module.exports = AtCommandCreator;
function AtCommandCreator() {
  this._number   = 0;
}

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

AtCommandCreator.prototype._createCommand = function(type, args) {
  var command = new AtCommand(type, this._number++, args);
  return command;
};
