var common    = require('../../common');
var assert    = require('assert');
var test      = require('utest');
var AtCommand = require(common.lib + '/control/AtCommand');

test('AtCommand', {
  'serializing': function() {
    var cmd = new AtCommand('FOO', [2, '3']);
    assert.equal(cmd.serialize(1), 'AT*FOO=1,2,3\r');
  },

  'bare callback or options object': function() {
    var cmd = new AtCommand('FOO', [2, '3']);
    assert.deepEqual(cmd.options, {});
    var callback = function() {};
    cmd = new AtCommand('FOO', [2, '3'], false, callback);
    assert.equal(cmd.blocks, false);
    assert.equal(cmd.options.callback, callback);
    cmd = new AtCommand('FOO', [2, '3'], false, { callback: callback });
    assert.equal(cmd.options.callback, callback);
  }
});
