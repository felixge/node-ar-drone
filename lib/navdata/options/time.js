var exports = module.exports = function parseTimeOption(reader, message) {
  var time = reader.uint32();
  // first 11 bits are seconds
  var seconds = time >> 21;
  // last 21 bits are microseconds
  var microseconds = (time << 11) >> 11;

  // Convert to ms (which is idiomatic for time in JS)
  message.time = seconds * 1000 + microseconds / 1000;
};
