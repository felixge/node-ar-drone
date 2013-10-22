module.exports = AtCommand;
function AtCommand(type, args, blocks, options, callback) {
  this.type   = type;
  this.args   = args;
  if (blocks === undefined) {
    blocks = false;
  }
  this.blocks = blocks;
  this.options = options || {};
  this.callback = callback;
}

AtCommand.prototype.serialize = function(sequenceNumber) {
  var args = [sequenceNumber].concat(this.args);
  return 'AT*' + this.type + '=' + args.join(',') + '\r';
};
