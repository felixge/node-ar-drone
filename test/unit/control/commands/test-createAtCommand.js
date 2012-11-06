var common          = require('../../../common');
var assert          = require('assert');
var test            = require('utest');
var createAtCommand = require(common.lib + '/control/commands/createAtCommand');

test('createAtCommand', {
  'creates an object with: type, args, number': function() {
    var type   = 'SOMETHING';
    var args   = [1, 2, 3];
    var number = 5;

    var atCommand = createAtCommand(type, args, number);
    assert.strictEqual(atCommand.type, type);
    assert.deepEqual(atCommand.args, args);
    assert.strictEqual(atCommand.number, number);
  },

  'args is cloned, not referenced': function() {
    var args = [1, 2, 3];
    var atCommand = createAtCommand(undefined, args);

    // cloned
    assert.deepEqual(atCommand.args, args);
    // but not referenced
    assert.ok(atCommand.args !== args);
  },

  'args is set to an empty array by default': function() {
    var cmd = createAtCommand();
    assert.equal(Array.isArray(cmd.args), true);
    assert.equal(cmd.args.length, 0);
  },

  'toString: serializes into a string': function() {
    var cmd = createAtCommand('FOO', [2, '3'], 1);
    assert.equal(cmd.toString(), 'AT*FOO=1,2,3\r');
  },
});
