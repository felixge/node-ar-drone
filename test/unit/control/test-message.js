var common = require('../../common');
var assert = require('assert');
var test = require('utest');
var createMessage = require(common.lib + '/control/message');

test('message', {
  'default properties': function() {
    var message = createMessage();
    assert.strictEqual(message.sequenceNumber, undefined);
    assert.strictEqual(Array.isArray(message.commands), true);
    assert.strictEqual(message.commands.length, 0);
  },

  'toString: concatinated all commands': function() {
    var commands = ['foo', {toString: function() { return 'bar'}}];
    var message = createMessage({commands: commands});
    assert.equal(message.toString(), 'foobar');
  },
});
