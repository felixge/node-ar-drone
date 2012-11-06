var _               = require('underscore');
var createAtMessage = require('./createAtMessage');

var exports = module.exports = function createAtMessageSequence() {
  return new AtMessageSequence();
};

exports = AtMessageSequence;
function AtMessageSequence() {
  this.number = 0;
}

AtMessageSequence.prototype.next = function(commands) {
  return createAtMessage(commands, this.number++);
};
