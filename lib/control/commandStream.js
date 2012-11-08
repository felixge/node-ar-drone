var util = require('util');
var commands = require('./commands');
var Stream = require('stream').Stream;
var createMessage = require('./message');

var exports = module.exports = function createCommandStream() {
  return new CommandStream();
};

exports.CommandStream = CommandStream;
util.inherits(CommandStream, Stream);
function CommandStream() {
  Stream.call(this);

  this.readable = true;

  this._messageNumber = 0;
  this._commandNumber = 0;
  this._bufferedMessage = null;
}

Object.keys(commands).forEach(function(name) {
  var createCommand = commands[name];

  CommandStream.prototype[name] = function(options) {
    if (!this._bufferedMessage) {
      this._bufferedMessage = createMessage({
        sequenceNumber: this._messageNumber++
      });
    }

    var command = createCommand(options, this._commandNumber++);
    this._bufferedMessage.commands.push(command);
  };
});

CommandStream.prototype.flush = function() {
  if (!this._bufferedMessage) {
    return;
  }

  this.emit('data', this._bufferedMessage);
  this._bufferedMessage = null;
};
