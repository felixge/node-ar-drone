var UdpControl = require('../lib/control/UdpControl');

var control = new UdpControl();
var takeoff = 0;

setInterval(function() {
  control.ref({takeoff: takeoff, emergency: true});
  control.pcmd();
  control.flush();
}, 30);

var count = 0;
process.on('SIGINT', function() {
  count++;

  if (count === 1) {
    console.log('takeoff');
    takeoff = 1;
    return;
  }

  if (count === 2) {
    console.log('land');
    takeoff = 0;
    return;
  }

  setTimeout(function() {
    process.exit(1);
  }, 100);
});
