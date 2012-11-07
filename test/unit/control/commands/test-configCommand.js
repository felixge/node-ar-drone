var common = require('../../../common');
var assert = require('assert');
var test = require('utest');
var configCommand = require(common.lib + '/control/commands/configCommand');

test('configCommand', {
  'default properties': function() {
    var cmd = configCommand();
    assert.strictEqual(cmd.type, 'CONFIG');
    assert.strictEqual(cmd.args.length, 2);
    assert.strictEqual(cmd.args[0], '""');
    assert.strictEqual(cmd.args[1], '""');
  },

  'passes number argument': function() {
    var cmd = configCommand(undefined, 5);
    assert.strictEqual(cmd.number, 5);
  },

  'takes key, value options': function() {
    var cmd = configCommand({key: 'foo', value: 'bar'});
    assert.strictEqual(cmd.args[0], '"foo"');
    assert.strictEqual(cmd.args[1], '"bar"');
  }
});
