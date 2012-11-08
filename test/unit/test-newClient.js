var common = require('../common');
var assert = require('assert');
var test = require('utest');
var newClient = require(common.lib + '/newClient');

test('newClient', {
  before: function() {
    //this.client = newClient();
  },

  'foo': function() {
    //console.log(this.client);
  },
});
