module.exports = AtCommand;
function AtCommand(type, args, blocks, options) {
  this.type   = type;
  this.args   = args;
  if (blocks === undefined) {
    blocks = false;
  }
  this.blocks = blocks;
  if (typeof(options) === 'function') {
    this.options = { callback: options };
  } else {
    this.options = options || {};
  }
}

AtCommand.prototype.serialize = function(sequenceNumber) {
  var args = [sequenceNumber].concat(this.args);
  return 'AT*' + this.type + '=' + args.join(',') + '\r';
};
