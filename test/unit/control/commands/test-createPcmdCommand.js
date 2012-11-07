var common              = require('../../../common');
var assert              = require('assert');
var test                = require('utest');
var createPcmdCommand = require(common.lib + '/control/commands/createPcmdCommand');
var atFloatToString     = require(common.lib + '/control/atFloatToString');

test('createPcmdCommand', {
  'default properties': function() {
    var cmd = createPcmdCommand();
    assert.strictEqual(cmd.type, 'PCMD');
    assert.strictEqual(cmd.args.length, 5);
    assert.strictEqual(cmd.args[0], 0);
    assert.strictEqual(cmd.args[1], 0);
    assert.strictEqual(cmd.args[2], 0);
    assert.strictEqual(cmd.args[3], 0);
    assert.strictEqual(cmd.args[4], 0);
  },

  'passes number argument': function() {
    var cmd = createPcmdCommand(undefined, 5);
    assert.strictEqual(cmd.number, 5);
  },

  'turns movement options into atFloatString arguments': function() {
    var val = 0.75;
    assert.equal(createPcmdCommand({leftRight: val}).args[1], atFloatToString(val));
    assert.equal(createPcmdCommand({frontBack: val}).args[2], atFloatToString(val));
    assert.equal(createPcmdCommand({upDown: val}).args[3], atFloatToString(val));
    assert.equal(createPcmdCommand({clockSpin: val}).args[4], atFloatToString(val));
  },

  'multiple movement options work together': function() {
    var cmd = createPcmdCommand({leftRight: -0.1, clockSpin: 0.3});
    assert.equal(cmd.args[1], atFloatToString(-0.1));
    assert.equal(cmd.args[4], atFloatToString(0.3));
  },

  'sets PROGRESSIVE flag when a movement option is provided': function() {
    var cmd = createPcmdCommand({leftRight: 0.1});
    assert.ok(cmd.args[0] & createPcmdCommand.PROGRESSIVE);
    assert.equal(createPcmdCommand.PROGRESSIVE, (1 << 0));
  },
});
