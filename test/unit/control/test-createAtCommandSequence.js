var common                  = require('../../common');
var assert                  = require('assert');
var test                    = require('utest');
var createAtCommandSequence = require(common.lib + '/control/createAtCommandSequence');

test('createAtCommandSequence', {
  before: function() {
    this.sequence = createAtCommandSequence();
  },

  'functions are aliased and incrementing numbers injected': function() {
    var methods = Object.keys(this.sequence.constructor.prototype);

    // check one method
    assert.ok(methods.indexOf('ref') > -1);

    // call all and test incrementing numbers
    var self = this;
    methods.forEach(function(method, i) {
      assert.equal(self.sequence[method]().number, i, method);
    });
  },

  'options are passed to the commands': function() {
    // just an example option being checked
    assert.equal(this.sequence.ref({fly: true}).args[0], 512);
  },
});
