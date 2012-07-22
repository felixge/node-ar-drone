module.exports = BitNumber;
function BitNumber(map) {
  this._number = 0;

  for (var offset in map) {
    this.setBit(Number(offset), map[offset]);
  }
}

BitNumber.prototype.setBit = function(offset, value) {
  if (value === undefined) value = 1;

  var mask = parseInt('1' + new Array(offset + 1).join('0'), 2);

  if (value === 1) {
    // OR the mask into the number
    this._number |= mask;
  } else {
    // Invert the mask, then AND it into the number.
    // see: https://developer.mozilla.org/en/JavaScript/Reference/Operators/Bitwise_Operators#Example:_Flags_and_bitmasks
    this._number &= ~mask;
  }
};

BitNumber.prototype.toString = function(base) {
  return this._number.toString(base || 10);
};
