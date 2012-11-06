var common              = require('../../../common');
var assert              = require('assert');
var test                = require('utest');
var createAtPcmdCommand = require(common.lib + '/control/commands/createAtPcmdCommand');
var atFloatToString     = require(common.lib + '/control/atFloatToString');

test('createAtPcmdCommand', {
  'default properties': function() {
    var cmd = createAtPcmdCommand();
    assert.strictEqual(cmd.type, 'PCMD');
    assert.strictEqual(cmd.args.length, 5);
    assert.strictEqual(cmd.args[0], 0);
    assert.strictEqual(cmd.args[1], 0);
    assert.strictEqual(cmd.args[2], 0);
    assert.strictEqual(cmd.args[3], 0);
    assert.strictEqual(cmd.args[4], 0);
  },

  'passes number property': function() {
    var cmd = createAtPcmdCommand({number: 5});
    assert.strictEqual(cmd.number, 5);
  },

  'turns movement options into atFloatString arguments': function() {
    var val = 0.75;
    assert.equal(createAtPcmdCommand({leftRight: val}).args[1], atFloatToString(val));
    assert.equal(createAtPcmdCommand({frontBack: val}).args[2], atFloatToString(val));
    assert.equal(createAtPcmdCommand({upDown: val}).args[3], atFloatToString(val));
    assert.equal(createAtPcmdCommand({clockSpin: val}).args[4], atFloatToString(val));
  },

  'multiple movement options work together': function() {
    var cmd = createAtPcmdCommand({leftRight: -0.1, clockSpin: 0.3});
    assert.equal(cmd.args[1], atFloatToString(-0.1));
    assert.equal(cmd.args[4], atFloatToString(0.3));
  },

  'sets PROGRESSIVE flag when a movement option is provided': function() {
    var cmd = createAtPcmdCommand({leftRight: 0.1});
    assert.ok(cmd.args[0] & createAtPcmdCommand.PROGRESSIVE);
    assert.equal(createAtPcmdCommand.PROGRESSIVE, (1 << 0));
  },
});
