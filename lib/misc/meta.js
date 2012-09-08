var meta = exports;

// lists public methods of a class
meta.methods = function(Constructor) {
  var methods = Object.keys(Constructor.prototype);

  return methods.filter(function(name) {
    return !/^_/.test(name);
  });
};
