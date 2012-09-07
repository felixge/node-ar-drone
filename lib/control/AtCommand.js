module.exports = AtCommand;
function AtCommand(type, number, args) {
  this.type   = type;
  this.number = number;
  this.args   = args;
}

AtCommand.prototype.toString = function() {
  var args = [this.number].concat(this.args);
  return 'AT*' + this.type + '=' + args.join(',') + '\r';
};
