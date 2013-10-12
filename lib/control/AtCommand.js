module.exports = AtCommand;
function AtCommand(type, args, blocks, options) {
  this.type   = type;
  this.args   = args;
  this.blocks = blocks;
  this.options = options || {};
}

AtCommand.prototype.serialize = function(sequenceNumber) {
  var args = [sequenceNumber].concat(this.args);
  return 'AT*' + this.type + '=' + args.join(',') + '\r';
};
