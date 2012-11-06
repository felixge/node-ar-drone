var common          = require('../../../common');
var assert          = require('assert');
var test            = require('utest');
var createAtRefCommand = require(common.lib + '/control/commands/createAtRefCommand');

test('createAtRefCommand', {
  'default properties': function() {
    var cmd = createAtRefCommand();
    assert.strictEqual(cmd.type, 'REF');
    assert.strictEqual(cmd.args.length, 1);
    assert.strictEqual(cmd.args[0], 0);
  },

  'passes number property': function() {
    var cmd = createAtRefCommand({number: 5});
    assert.strictEqual(cmd.number, 5);
  },

  'emergency': function() {
    assert.equal(createAtRefCommand.EMERGENCY, 1 << 8);
    var cmd = createAtRefCommand({emergency: true});
    assert.ok(cmd.args[0] & createAtRefCommand.EMERGENCY);
  },

  'fly': function() {
    assert.equal(createAtRefCommand.FLY, 1 << 9);
    var cmd = createAtRefCommand({fly: true});
    assert.ok(cmd.args[0] & createAtRefCommand.FLY);
  },
});
