var Navdata = require('./Navdata');
var constants = require('./constants');

module.exports = NavdataParser;
function NavdataParser(buffer) {
  this._buffer = buffer;
  this._offset = 0;
}

NavdataParser.prototype.parse = function() {
  var header = this.number(4);

  if (header !== 0x55667788) {
    // Been seeing 0x55667789 as the header value, could not find
    // information about this packet type yet - so ignoring it.
    return;
  }

  var droneState = this.bitmap(4, constants.droneStates);
  var sequence   = this.number(4);

   // @TODO: ARDrone_SDK_2_0/ARDroneLib/Soft/Common/navdata_common.h
   // seems to indicate that this is treated as a boolean (vision_defined),
   // but I still need to figure out how to handle this.
  var visionFlag = this.number(4);
  var options = this.options();

  return new Navdata({
    sequence   : sequence,
    droneState : droneState,
    visionFlag : visionFlag,
    options    : options,
  });
};

NavdataParser.prototype.number = function(bytes) {
  var bytesRead = 0;
  var value     = 0;

  while (bytesRead < bytes) {
    var byte = this._buffer[this._offset++];

    value += byte * Math.pow(256, bytesRead);

    bytesRead++;
  }

  return value;
};

NavdataParser.prototype.int16 = function() {
  var value = this._buffer.readInt16LE(this._offset);
  this._offset += 2;
  return value;
};

NavdataParser.prototype.uint16 = function() {
  var value = this._buffer.readUInt16LE(this._offset);
  this._offset += 2;
  return value;
};

NavdataParser.prototype.uint32 = function() {
  var value = this._buffer.readUInt32LE(this._offset);
  this._offset += 4;
  return value;
};

NavdataParser.prototype.int32 = function() {
  var value = this._buffer.readInt32LE(this._offset);
  this._offset += 4;
  return value;
};

NavdataParser.prototype.float = function() {
  var value = this._buffer.readFloatLE(this._offset);
  this._offset += 4;
  return value;
};


NavdataParser.prototype.bytesLeft = function() {
  return this._buffer.length - this._offset;
};

NavdataParser.prototype.skip = function(bytes) {
  this._offset += bytes;
};

NavdataParser.prototype.bitmap = function(bytes, map) {
  var value = this.number(bytes);

  var flags = {};
  for (var flag in map) {
    flags[flag] = Boolean(value & map[flag]);
  }

  return flags;
};

NavdataParser.prototype.options = function() {
  var options = {};

  while (this.bytesLeft()) {
    var optionId = this.number(2);
    var size     = this.number(2) - 4; // size includes this header

    var end = this._offset + size;
    var option = undefined;

    // see ARDrone_SDK_2_0/ARDroneLib/Soft/Common/navdata_common.h
    switch (optionId) {
      case constants.options.DEMO:
        option = {
          ctrlState            : this.uint32(),
          vbatFlyingPercentage : this.uint32(),
          pitch                : this.float(),
          roll                 : this.float(),
          yaw                  : this.float(),
          altitude             : this.int32(4),
          velocityX            : this.float(),
          velocityY            : this.float(),
          velocityZ            : this.float(),
        };

        // More stuff to parse here, but all deprecated according to SDK
        break;
      case constants.options.TIME:
        var time         = this.uint32();
        // first 11 bits are seconds
        var seconds      = time >> 21;
        // last 21 bits are microseconds
        var microseconds  = (time << 11) >> 11;

        // Convert to ms (which is idiomatic for time in JS)
        option = seconds * 1000 + microseconds / 1000;
        break;
      case constants.options.RAW_MEASURES:
        option = {
          raw_accs            : this.uint16(),
          raw_gyros           : this.int16(),
          raw_gyros_110       : this.int16(),
          vbat_raw            : this.uint32(),
          us_debut_echo       : this.uint16(),
          us_fin_echo         : this.uint16(),
          us_association_echo : this.uint16(),
          us_distance_echo    : this.uint16(),
          us_courbe_temps     : this.uint16(),
          us_courbe_valeur    : this.uint16(),
          us_courbe_ref       : this.uint16(),
          flag_echo_ini       : this.uint16(),
          nb_echo             : this.uint16(),
          sum_echo            : this.uint32(),
          alt_temp_raw        : this.int32(),
          gradient            : this.int16(),
        };
        break;
      case constants.options.ALTITUDE:
        option = {
          altitude_vision: this.int32(),
          altitude_vz: this.float(),
          altitude_ref: this.int32(),
          altitude_raw: this.int32(),
          obs_accZ: this.float(),
          obs_alt: this.float(),
        };
        break;
      case constants.options.MAGNETO:
        option = {
          mx: this.int16(),
          my: this.int16(),
          mz: this.int16(),
        };
        break;
      default:
        option = 'Not implemented yet';
        break;
    }

    var name      = constants.getName('options', optionId);
    options[name] = option;

    if (this._offset > end) {
      throw new Error('Exceeded option boundary: ' + name);
    }

    this._offset = end;
  }

  return options;
};
