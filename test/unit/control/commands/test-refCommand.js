var common          = require('../../../common');
var assert          = require('assert');
var test            = require('utest');
var refCommand = require(common.lib + '/control/commands/refCommand');

test('refCommand', {
  'default properties': function() {
    var cmd = refCommand();
    assert.strictEqual(cmd.type, 'REF');
    assert.strictEqual(cmd.args.length, 1);
    assert.strictEqual(cmd.args[0], 0);
  },

  'passes number argument': function() {
    var cmd = refCommand(undefined, 5);
    assert.strictEqual(cmd.number, 5);
  },

  'emergency': function() {
    assert.equal(refCommand.EMERGENCY, 1 << 8);
    var cmd = refCommand({emergency: true});
    assert.ok(cmd.args[0] & refCommand.EMERGENCY);
  },

  'fly': function() {
    assert.equal(refCommand.FLY, 1 << 9);
    var cmd = refCommand({fly: true});
    assert.ok(cmd.args[0] & refCommand.FLY);
  },
});
