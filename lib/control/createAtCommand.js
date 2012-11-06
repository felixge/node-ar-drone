var _ = require('underscore');

module.exports = function createAtCommand(type, args, number) {
  args = _.clone(args) || [];

  return new AtCommand(type, args, number);
};

module.exports.AtCommand = AtCommand;
function AtCommand(type, args, number) {
  this.type   = type;
  this.args   = args;
  this.number = number;
}

AtCommand.prototype.toString = function() {
  var args = [this.number].concat(this.args);
  return 'AT*' + this.type + '=' + args.join(',') + '\r';
};
