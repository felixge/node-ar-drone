var common = require('../../../common');
var assert = require('assert');
var test = require('utest');
var pcmdCommand = require(common.lib + '/control/commands/pcmdCommand');
var atFloatToString = require(common.lib + '/control/atFloatToString');

test('pcmdCommand', {
  'default properties': function() {
    var cmd = pcmdCommand();
    assert.strictEqual(cmd.type, 'PCMD');
    assert.strictEqual(cmd.args.length, 5);
    assert.strictEqual(cmd.args[0], 0);
    assert.strictEqual(cmd.args[1], 0);
    assert.strictEqual(cmd.args[2], 0);
    assert.strictEqual(cmd.args[3], 0);
    assert.strictEqual(cmd.args[4], 0);
  },

  'passes number argument': function() {
    var cmd = pcmdCommand(undefined, 5);
    assert.strictEqual(cmd.sequenceNumber, 5);
  },

  'turns movement options into atFloatString arguments': function() {
    var val = 0.75;
    assert.equal(pcmdCommand({leftRight: val}).args[1], atFloatToString(val));
    assert.equal(pcmdCommand({frontBack: val}).args[2], atFloatToString(val));
    assert.equal(pcmdCommand({upDown: val}).args[3], atFloatToString(val));
    assert.equal(pcmdCommand({clockSpin: val}).args[4], atFloatToString(val));
  },

  'multiple movement options work together': function() {
    var cmd = pcmdCommand({leftRight: -0.1, clockSpin: 0.3});
    assert.equal(cmd.args[1], atFloatToString(-0.1));
    assert.equal(cmd.args[4], atFloatToString(0.3));
  },

  'sets PROGRESSIVE flag when a movement option is provided': function() {
    var cmd = pcmdCommand({leftRight: 0.1});
    assert.ok(cmd.args[0] & pcmdCommand.PROGRESSIVE);
    assert.equal(pcmdCommand.PROGRESSIVE, (1 << 0));
  },
});
