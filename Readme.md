# node-ar-drone

## Getting started

* Turn on your 2.0 AR Drone (1.0 is not supported)
* Join the WiFi Network of your drone with your computer
* Create a fantastic REPL for yourself, call it `repl.js`:

```js
var dron = require('ar-drone').createDrone();
dron.startRepl();
```

Start the repl and have some fun!

```
$ node repl.js
Connecting to drone ... done!

drone> takeoff()
... Wait a little
drone> land()
```

More to come soon!
