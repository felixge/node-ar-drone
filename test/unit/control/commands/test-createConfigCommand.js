var common                = require('../../../common');
var assert                = require('assert');
var test                  = require('utest');
var createConfigCommand = require(common.lib + '/control/commands/createConfigCommand');

test('createConfigCommand', {
  'default properties': function() {
    var cmd = createConfigCommand();
    assert.strictEqual(cmd.type, 'CONFIG');
    assert.strictEqual(cmd.args.length, 2);
    assert.strictEqual(cmd.args[0], '""');
    assert.strictEqual(cmd.args[1], '""');
  },

  'passes number argument': function() {
    var cmd = createConfigCommand(undefined, 5);
    assert.strictEqual(cmd.number, 5);
  },

  'takes key, value options': function() {
    var cmd = createConfigCommand({key: 'foo', value: 'bar'});
    assert.strictEqual(cmd.args[0], '"foo"');
    assert.strictEqual(cmd.args[1], '"bar"');
  }
});
