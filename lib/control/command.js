var _ = require('underscore');

module.exports = function command(type, args, sequenceNumber) {
  args = _.clone(args) || [];

  return new Command(type, args, sequenceNumber);
};

module.exports.Command = Command;
function Command(type, args, sequenceNumber) {
  this.type = type;
  this.args = args;
  this.sequenceNumber = sequenceNumber;
}

Command.prototype.toString = function() {
  var args = [this.sequenceNumber].concat(this.args);
  return 'AT*' + this.type + '=' + args.join(',') + '\r';
};
