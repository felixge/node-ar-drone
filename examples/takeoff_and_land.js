var arDrone = require('ar-drone');
var client  = arDrone.createClient();

// return all navdata
client.config('general:navdata_demo', 'FALSE');

// log navdata
client.on('navdata', function (navdata) {
  console.log('// NAVDATA\n', navdata);
});

client.on('error', function (err) {
  console.log('ERROR:', err);
});

client
  .after(2*1000, function () {
    console.log('// TAKEOFF\n');
    this.takeoff();
  })
  .after(8*1000, function () {
    console.log('// LAND\n');
    this.land();
  });
