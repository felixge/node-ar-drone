var common  = require('../common');
var assert  = require('assert');
var utest   = require('utest');
var sinon   = require('sinon');
var arDrone = require(common.root);

utest('main api', {
  before: function() {
    sinon.stub(arDrone.PngStream.prototype, 'start');
  },

  after: function() {
    arDrone.PngStream.prototype.start.restore();
  },

  'createPngStream': function() {
    var pngStream = arDrone.createPngStream();
    assert.ok(pngStream instanceof arDrone.PngStream);
    assert.equal(pngStream.start.callCount, 1);
  },

  'createUdpControl': function() {
    var control = arDrone.createUdpControl();
    assert.ok(control instanceof arDrone.UdpControl);
  },
});
