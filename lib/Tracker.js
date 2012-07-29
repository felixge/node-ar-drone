var EventEmitter = require('events').EventEmitter;
var util         = require('util');
var WebCam       = require('./WebCam');

try {
  var opencv = require('opencv');
} catch (err) {
  // opencv not available
}


module.exports = Tracker;
util.inherits(Tracker, EventEmitter);
function Tracker(options) {
  EventEmitter.call(this);

  this._source   = options.source;
  this._image    = null;
  this._trackers = {};
}

Tracker.prototype.start = function() {
  this._source.on('data', this._handleImage.bind(this));
};

Tracker.prototype.track = function(name, schemaPath) {
  this._trackers[name]= new opencv.CascadeClassifier(schemaPath);
};

Tracker.prototype.webCam = function(options) {
  var source = new EventEmitter();

  this.on('data', function(results, image) {
    for (var name in results) {
      var positions = results[name];

      for (var i = 0; i < positions.length; i++){
        var x = positions[i];
        image.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2, 0x000000FF);
      }

      source.emit('data', image.toBuffer());
    }
  });

  options        = Object.create(options);
  options.source = source;

  var stream = new WebCam(options);
  stream.start();
  return stream;
};

Tracker.prototype._handleImage = function(image) {
  var first = (!this._image);

  this._image = image;
  if (first) {
    this._analyze();
  }
};

Tracker.prototype._analyze = function() {
  var self = this;

  opencv.readImage(this._image, this._findObjects.bind(this));
};

Tracker.prototype._findObjects = function(err, image) {
  if (err) throw err; // @TODO Can this happen? How should it be handled?

  var self    = this;
  var names   = Object.keys(this._trackers);
  var results = {};

  names.forEach(function(name) {
    var schema = self._trackers[name];

    schema.detectMultiScale(image, function(err, positions) {
      if (err) throw err; // @TODO handle this?

      names.pop();
      results[name] = positions;

      if (!names.length) {
        self.emit('data', results, image);
        self._analyze();
      }
    });
  });
};
