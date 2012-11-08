var common = require('../../common');
var assert = require('assert');
var sinon = require('sinon');
var test = require('utest');
var commands = require(common.lib + '/control/commands');
var createCommandStream = require(common.lib + '/control/commandStream');

test('commandStream', {
  before: function() {
    this.stream = createCommandStream();
  },

  'readable stream interface': function() {
    assert.strictEqual(this.stream.readable, true);
    assert.strictEqual(typeof this.stream.pipe, 'function');
  },

  'creates commands and wraps them in messages on flush': function() {
    var dataSpy = sinon.spy();
    this.stream.on('data', dataSpy);

    var commandNames = Object.keys(commands);

    // check one method
    assert.ok(commandNames.indexOf('ref') > -1);

    // call all and test incrementing numbers
    var self = this;
    commandNames.forEach(function(name, i) {
      self.stream[name]();
    });

    assert.strictEqual(dataSpy.callCount, 0);

    this.stream.flush();

    assert.strictEqual(dataSpy.callCount, 1);
    var message = dataSpy.lastCall.args[0];
    commandNames.forEach(function(name, i) {
      assert.strictEqual(message.commands[i].type, name.toUpperCase());
      assert.strictEqual(message.commands[i].sequenceNumber, i);
    });

    // does not do anything if there is no message queued up
    this.stream.flush();
    assert.strictEqual(dataSpy.callCount, 1);
  },

});
