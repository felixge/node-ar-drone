var common  = require('../common');
var assert  = require('assert');
var utest   = require('utest');
var arDrone = require(common.root);

utest('main api', {
  'createPngStream': function() {
    var pngStream = arDrone.createPngStream();
    assert.ok(pngStream instanceof arDrone.PngStream);
  },

  'createUdpControl': function() {
    var control = arDrone.createUdpControl();
    assert.ok(control instanceof arDrone.UdpControl);
  },
});
