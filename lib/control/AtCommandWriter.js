var AtCommand = require('./AtCommand');

module.exports = AtCommandWriter;
function AtCommandWriter() {
  this._number   = 0;
  //this._commands = [];
}

AtCommandWriter.prototype.ref = function(options) {
  options = options || {};

  var flags = 0;

  if (options.takeoff) {
    flags = flags | (1 << 9);
  }

  if (options.emergency) {
    flags = flags | (1 << 8);
  }

  return this._pushCommand('REF', [flags]);
};

AtCommandWriter.prototype._pushCommand = function(type, args) {
  var command = new AtCommand(type, this._number++, args);
  //this._commands.push(command);
  return command;
};

AtCommandWriter.prototype.toJSON = function() {
  return this._commands;
};
