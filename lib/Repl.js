var repl       = require('repl');
var vm         = require('vm');

module.exports = Repl;
function Repl(client) {
  this._client   = client;
  this._repl     = null;
  this._nodeEval = null;
}

Repl.prototype.resume = function() {
  this._repl = repl.start({
    prompt : 'drone> ',
  });

  this._nodeEval = this._repl.eval;

  // @TODO This does not seem to work for animate('yawShake', 2000), need
  // to fix this.
  //this._repl.eval = this._eval.bind(this);

  this._setupAutocomplete();
};

Repl.prototype._setupAutocomplete = function() {
  for (var property in this._client) {
    if (property.substr(0, 1) === '_') {
      // Skip "private" properties
      continue;
    }

    var value = this._client[property];
    if (typeof value === 'function') {
      value = value.bind(this._client);
    }

    this._repl.context[property] = value;
  }

  this._repl.context.client = this._client;
};

Repl.prototype._eval = function(code, context, filename, cb) {
  var args = code.match(/[^() \n]+/g);
  if (!args) {
    return this._nodeEval.apply(this._repl, arguments);
  }

  var property = args.shift();
  if (!this._client[property]) {
    return this._nodeEval.apply(this._repl, arguments);
  }

  var type = typeof this._client[property];

  if (type === 'function') {
    try {
      cb(null, this._client[property].apply(this._client, args));
    } catch (err) {
      cb(err);
    }
    return;
  }

  if (args.length > 1) {
    // Don't accept more than 1 argument
    cb(new Error('Cannot set property "' + property + '". Too many arguments.'));
    return;
  }

  if (args.length === 1) {
    // Set a client property
    cb(null, this._client[property] = args[1]);
    return;
  }

  // args.length === 0, return property value
  cb(null, this._client[property]);
};
