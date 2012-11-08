var exports = module.exports = function flattenObject(object) {
  return flatten(object);
};

function flatten(object, result, prefix) {
  result = result || {};
  prefix = prefix || '';

  for (var key in object) {
    var value = object[key];

    if (typeof value === 'object') {
      flatten(object[key], result, prefix + key + '.');
    } else {
      result[prefix + key] = value;
    }
  }

  return result;
}
