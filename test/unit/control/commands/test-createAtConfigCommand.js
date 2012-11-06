var common                = require('../../../common');
var assert                = require('assert');
var test                  = require('utest');
var createAtConfigCommand = require(common.lib + '/control/commands/createAtConfigCommand');

test('createAtConfigCommand', {
  'default properties': function() {
    var cmd = createAtConfigCommand();
    assert.strictEqual(cmd.type, 'CONFIG');
    assert.strictEqual(cmd.args.length, 2);
    assert.strictEqual(cmd.args[0], '""');
    assert.strictEqual(cmd.args[1], '""');
  },

  'passes number property': function() {
    var cmd = createAtConfigCommand({number: 5});
    assert.strictEqual(cmd.number, 5);
  },

  'takes key, value options': function() {
    var cmd = createAtConfigCommand({key: 'foo', value: 'bar'});
    assert.strictEqual(cmd.args[0], '"foo"');
    assert.strictEqual(cmd.args[1], '"bar"');
  }
});
