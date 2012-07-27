module.exports = Sequence;
function Sequence(client) {
  this._client   = client;
  this._queue    = [];
  this._callback = null;

  this._createInterface();
}

Sequence.prototype._createInterface = function() {
  var methods = Object.keys(this._client.constructor.prototype);
  for (var i = 0; i < methods.length; i++) {
    var method = methods[i];

    var isPrivate = (method.substr(0, 1) === '_');
    if (isPrivate) {
      continue;
    }

    this[method] = function(method) {
      var args    = Array.prototype.slice.call(arguments, 1);
      var seconds = args.shift();

      this._queue.push({
        method  : method,
        seconds : seconds || 0,
        args    : args,
      });

      return this;
    }.bind(this, method);
  }
};

Sequence.prototype.start = function(cb) {
  this._cb = cb;
  this._next();
};

Sequence.prototype._next = function() {
  var item = this._queue.shift();
  if (!item) {
    if (this._cb) {
      this._cb(null);
      this._cb = null;
    }

    return;
  }


  this._client[item.method].apply(this._client, item.args);
  setTimeout(this._next.bind(this), item.seconds * 1000);
};
