var util   = require('util');
var Reader = require('buffy').Reader;

module.exports = NavdataReader;
util.inherits(NavdataReader, Reader);
function NavdataReader(buffer) {
  Reader.call(this, buffer);
}

NavdataReader.prototype.int16 = function() {
  return this.int16LE();
};

NavdataReader.prototype.uint16 = function() {
  return this.uint16LE();
};

NavdataReader.prototype.int32 = function() {
  return this.int32LE();
};

NavdataReader.prototype.uint32 = function() {
  return this.uint32LE();
};

NavdataReader.prototype.float32 = function() {
  return this.float32LE();
};

NavdataReader.prototype.double64 = function() {
  return this.double64LE();
};

NavdataReader.prototype.char = function() {
  return this.uint8();
};

NavdataReader.prototype.bool = function() {
  return !!this.char();
};

NavdataReader.prototype.matrix33 = function() {
  return {
    m11 : this.float32(),
    m12 : this.float32(),
    m13 : this.float32(),
    m21 : this.float32(),
    m22 : this.float32(),
    m23 : this.float32(),
    m31 : this.float32(),
    m32 : this.float32(),
    m33 : this.float32()
  };
};

NavdataReader.prototype.vector31 = function() {
  return {
    x : this.float32(),
    y : this.float32(),
    z : this.float32()
  };
};

NavdataReader.prototype.screenPoint = function() {
  return {
    x : this.int32(),
    y : this.int32()
  };
};

NavdataReader.prototype.satChannel = function() {
  return {
    sat: this.uint8(),
    cn0: this.uint8()
  };
};

NavdataReader.prototype.mask32 = function(mask) {
  var value = this.uint32();
  return this._mask(mask, value);
};

NavdataReader.prototype._mask = function(mask, value) {
  var flags = {};
  for (var flag in mask) {
    flags[flag] = (value & mask[flag])
      ? 1
      : 0;
  }

  return flags;
};
