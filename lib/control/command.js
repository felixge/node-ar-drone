var _ = require('underscore');

module.exports = function command(type, args, number) {
  args = _.clone(args) || [];

  return new Command(type, args, number);
};

module.exports.Command = Command;
function Command(type, args, number) {
  this.type = type;
  this.args = args;
  this.number = number;
}

Command.prototype.toString = function() {
  var args = [this.number].concat(this.args);
  return 'AT*' + this.type + '=' + args.join(',') + '\r';
};
