var common    = require('../../common');
var assert    = require('assert');
var test      = require('utest');
var AtCommand = require(common.lib + '/control/AtCommand');

test('AtCommand', {
  'serializing': function() {
    var cmd = new AtCommand('FOO', [2, '3']);
    assert.equal(cmd.serialize(1), 'AT*FOO=1,2,3\r');
    assert.equal(cmd.serialize(2), 'AT*FOO=2,2,3\r');
  },

  'bare callback or options object': function() {
    var cmd = new AtCommand('FOO', [2, '3']);
    assert.deepEqual(cmd.args, [2, '3']);
    assert(!cmd.blocks);
    assert.deepEqual(cmd.options, {});
    assert(!cmd.callback);
    assert.equal(cmd.serialize(1), 'AT*FOO=1,2,3\r');
    var callback = function() {};
    var options = { timeout: 1 };
    cmd = new AtCommand('FOO', [2, '3'], false, options, callback);
    assert.deepEqual(cmd.args, [2, '3']);
    assert(!cmd.blocks);
    assert.deepEqual(cmd.options, options);
    assert.equal(cmd.callback, callback);
    assert.equal(cmd.serialize(1), 'AT*FOO=1,2,3\r');
    cmd = new AtCommand('FOO', [2, '3'], true);
    assert.deepEqual(cmd.args, [2, '3']);
    assert(cmd.blocks);
    assert.deepEqual(cmd.options, {});
    assert(!cmd.callback);
    assert.equal(cmd.serialize(1), 'AT*FOO=1,2,3\r');
  }
});
