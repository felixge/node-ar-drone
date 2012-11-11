exports.TAG_TYPE_MASK = function (tagtype) {
  return (tagtype == 0) ? 0 : 1 << (tagtype - 1);
};

exports.NAVDATA_OPTION_MASK = function (option) {
  return 1 << option;
};

exports.maskFromNavdataOptions = function (options) {
  if (!Array.isArray(options)) {
    options = Array.prototype.slice.call(arguments);
  }

  var masks = options.map(exports.NAVDATA_OPTION_MASK);
  var mask  = masks.reduce(function (prev, curr) {
    return prev | curr;
  });

  return mask;
};


NAVDATA_OPTION_MASK(constants.options.DEMO) |
  NAVDATA_OPTION_MASK(constants.options.VISION_DETECT) |
  NAVDATA_OPTION_MASK(constants.options.EULER_ANGLES)
