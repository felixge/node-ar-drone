var commands = require('./commands');

var exports = module.exports = function commandSequence() {
  return new AtCommandSequence();
};

function AtCommandSequence() {
  this.number = 0;
}

// create .ref(), .pcmd(), etc. functions
Object.keys(commands).forEach(function(name) {
  var alias = name.match(/(.+?)Command/)[1];
  var command = commands[name];

  AtCommandSequence.prototype[alias] = function(options) {
    return command(options, this.number++);
  };
});

