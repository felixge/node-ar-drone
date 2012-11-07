var common          = require('../../../common');
var assert          = require('assert');
var test            = require('utest');
var createRefCommand = require(common.lib + '/control/commands/createRefCommand');

test('createRefCommand', {
  'default properties': function() {
    var cmd = createRefCommand();
    assert.strictEqual(cmd.type, 'REF');
    assert.strictEqual(cmd.args.length, 1);
    assert.strictEqual(cmd.args[0], 0);
  },

  'passes number argument': function() {
    var cmd = createRefCommand(undefined, 5);
    assert.strictEqual(cmd.number, 5);
  },

  'emergency': function() {
    assert.equal(createRefCommand.EMERGENCY, 1 << 8);
    var cmd = createRefCommand({emergency: true});
    assert.ok(cmd.args[0] & createRefCommand.EMERGENCY);
  },

  'fly': function() {
    assert.equal(createRefCommand.FLY, 1 << 9);
    var cmd = createRefCommand({fly: true});
    assert.ok(cmd.args[0] & createRefCommand.FLY);
  },
});
