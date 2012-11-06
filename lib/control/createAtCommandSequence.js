var commands = require('./commands');

var exports = module.exports = function createAtCommandSequence() {
  return new AtCommandSequence();
};

function AtCommandSequence() {
  this.number = 0;
}

// create .ref(), .pcmd(), etc. functions
Object.keys(commands).forEach(function(name) {
  var alias = name.match(/createAt(.+?)Command/)[1].toLowerCase();
  var createCommand = commands[name];

  AtCommandSequence.prototype[alias] = function(options) {
    return createCommand(options, this.number++);
  };
});

