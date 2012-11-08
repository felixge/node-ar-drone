var exports = module.exports = function iso8601Date(date) {
  date = date || new Date();

  var offset = -date.getTimezoneOffset();
  var offsetMinutes = (offset % 60);
  var offsetHours = ((offset - offsetMinutes) / 60);

  return (
    date.getFullYear()+'-' +
    pad(date.getMonth()+1)+'-' +
    pad(date.getDate())+'T' +
    pad(date.getHours())+':' +
    pad(date.getMinutes())+':' +
    pad(date.getSeconds())+'+' +
    pad(offsetHours)+':' +
    pad(offsetMinutes)
);
}

function pad(number) {
  return number < 10
    ? '0' + number
    : number
}

