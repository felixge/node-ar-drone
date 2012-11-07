var common       = require('../common');
var assert       = require('assert');
var test         = require('utest');
var config = require(common.lib + '/config');

test('config', {
  before: function() {
    this.config = config();
  },

  'default properties': function() {
    assert.equal(this.config.ip, '192.168.1.1');
    assert.equal(this.config.controlInterval, 30);

    assert.equal(this.config.ftpPort, 5551);
    assert.equal(this.config.authPort, 5552);
    assert.equal(this.config.videoRecorderPort, 5553);
    assert.equal(this.config.navdataPort, 5554);
    assert.equal(this.config.videoPort, 5555);
    assert.equal(this.config.atPort, 5556);
    assert.equal(this.config.rawCapturePort, 5557);
    assert.equal(this.config.printfPort, 5558);
    assert.equal(this.config.controlPort, 5557);
  },
});
