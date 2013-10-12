var common    = require('../../common');
var assert    = require('assert');
var test      = require('utest');
var AtCommand = require(common.lib + '/control/AtCommand');

test('AtCommand', {
  'converting to string': function() {
    var cmd = new AtCommand('FOO', [2, '3']);
    assert.equal(cmd.serialize(1), 'AT*FOO=1,2,3\r');
  },
});
