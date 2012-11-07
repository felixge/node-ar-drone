var common          = require('../../common');
var assert          = require('assert');
var test            = require('utest');
var createMessage = require(common.lib + '/control/createMessage');

test('createMessage', {
  'default properties': function() {
    var msg = createMessage();
    assert.strictEqual(msg.number, undefined);
    assert.strictEqual(Array.isArray(msg.commands), true);
    assert.strictEqual(msg.commands.length, 0);
  },

  'commands are deep cloned': function() {
    var commands = [{foo: 'bar'}];
    var msg      = createMessage(commands);

    assert.deepEqual(commands, msg.commands);
    assert.ok(msg.commands !== commands);
    assert.ok(msg.commands[0] !== commands[0]);
  },

  'toString: concatinated all commands': function() {
    var commands = ['foo', {toString: function() { return 'bar'}}];
    assert.equal(createMessage(commands).toString(), 'foobar');
  },
});
