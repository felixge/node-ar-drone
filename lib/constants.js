// Constants required to decode/encode the network communication with the drone.
// Names taken from the official SDK are not renamed, but:
//
// * Consistent prefixes/suffixes are stripped
// * Always converted to UPPER_CASE

var constants = module.exports;

constants.getName = function(group, value) {
  group = this[group];

  for (var name in group) {
    if (group[name] === value) {
      return name;
    }
  }
};

constants.DEFAULT_DRONE_IP = process.env.DEFAULT_DRONE_IP || '192.168.1.1';

// from ARDrone_SDK_2_0/ARDroneLib/Soft/Common/config.h
constants.ports = {
  FTP            : 5551,
  AUTH           : 5552,
  VIDEO_RECORDER : 5553,
  NAVDATA        : 5554,
  VIDEO          : 5555,
  AT             : 5556,
  RAW_CAPTURE    : 5557,
  PRINTF         : 5558,
  CONTROL        : 5559
};

// from ARDrone_SDK_2_0/ARDroneLib/Soft/Common/config.h
constants.droneStates = {
  FLY_MASK            : 1 << 0,  /*!< FLY MASK : (0) ardrone is landed, (1) ardrone is flying */
  VIDEO_MASK          : 1 << 1,  /*!< VIDEO MASK : (0) video disable, (1) video enable */
  VISION_MASK         : 1 << 2,  /*!< VISION MASK : (0) vision disable, (1) vision enable */
  CONTROL_MASK        : 1 << 3,  /*!< CONTROL ALGO : (0) euler angles control, (1) angular speed control */
  ALTITUDE_MASK       : 1 << 4,  /*!< ALTITUDE CONTROL ALGO : (0) altitude control inactive (1) altitude control active */
  USER_FEEDBACK_START : 1 << 5,  /*!< USER feedback : Start button state */
  COMMAND_MASK        : 1 << 6,  /*!< Control command ACK : (0) None, (1) one received */
  CAMERA_MASK         : 1 << 7,  /*!< CAMERA MASK : (0) camera not ready, (1) Camera ready */
  TRAVELLING_MASK     : 1 << 8,  /*!< Travelling mask : (0) disable, (1) enable */
  USB_MASK            : 1 << 9,  /*!< USB key : (0) usb key not ready, (1) usb key ready */
  NAVDATA_DEMO_MASK   : 1 << 10, /*!< Navdata demo : (0) All navdata, (1) only navdata demo */
  NAVDATA_BOOTSTRAP   : 1 << 11, /*!< Navdata bootstrap : (0) options sent in all or demo mode, (1) no navdata options sent */
  MOTORS_MASK         : 1 << 12, /*!< Motors status : (0) Ok, (1) Motors problem */
  COM_LOST_MASK       : 1 << 13, /*!< Communication Lost : (1) com problem, (0) Com is ok */
  SOFTWARE_FAULT      : 1 << 14, /*!< Software fault detected - user should land as quick as possible (1) */
  VBAT_LOW            : 1 << 15, /*!< VBat low : (1) too low, (0) Ok */
  USER_EL             : 1 << 16, /*!< User Emergency Landing : (1) User EL is ON, (0) User EL is OFF*/
  TIMER_ELAPSED       : 1 << 17, /*!< Timer elapsed : (1) elapsed, (0) not elapsed */
  MAGNETO_NEEDS_CALIB : 1 << 18, /*!< Magnetometer calibration state : (0) Ok, no calibration needed, (1) not ok, calibration needed */
  ANGLES_OUT_OF_RANGE : 1 << 19, /*!< Angles : (0) Ok, (1) out of range */
  WIND_MASK           : 1 << 20, /*!< WIND MASK: (0) ok, (1) Too much wind */
  ULTRASOUND_MASK     : 1 << 21, /*!< Ultrasonic sensor : (0) Ok, (1) deaf */
  CUTOUT_MASK         : 1 << 22, /*!< Cutout system detection : (0) Not detected, (1) detected */
  PIC_VERSION_MASK    : 1 << 23, /*!< PIC Version number OK : (0) a bad version number, (1) version number is OK */
  ATCODEC_THREAD_ON   : 1 << 24, /*!< ATCodec thread ON : (0) thread OFF (1) thread ON */
  NAVDATA_THREAD_ON   : 1 << 25, /*!< Navdata thread ON : (0) thread OFF (1) thread ON */
  VIDEO_THREAD_ON     : 1 << 26, /*!< Video thread ON : (0) thread OFF (1) thread ON */
  ACQ_THREAD_ON       : 1 << 27, /*!< Acquisition thread ON : (0) thread OFF (1) thread ON */
  CTRL_WATCHDOG_MASK  : 1 << 28, /*!< CTRL watchdog : (1) delay in control execution (> 5ms), (0) control is well scheduled */
  ADC_WATCHDOG_MASK   : 1 << 29, /*!< ADC Watchdog : (1) delay in uart2 dsr (> 5ms), (0) uart2 is good */
  COM_WATCHDOG_MASK   : 1 << 30, /*!< Communication Watchdog : (1) com problem, (0) Com is ok */
  EMERGENCY_MASK      : 1 << 31  /*!< Emergency landing : (0) no emergency, (1) emergency */
};


// from ARDrone_SDK_2_0/ARDroneLib/Soft/Common/navdata_keys.h
constants.options = {
  DEMO              : 0,
  TIME              : 1,
  RAW_MEASURES      : 2,
  PHYS_MEASURES     : 3,
  GYROS_OFFSETS     : 4,
  EULER_ANGLES      : 5,
  REFERENCES        : 6,
  TRIMS             : 7,
  RC_REFERENCES     : 8,
  PWM               : 9,
  ALTITUDE          : 10,
  VISION_RAW        : 11,
  VISION_OF         : 12,
  VISION            : 13,
  VISION_PERF       : 14,
  TRACKERS_SEND     : 15,
  VISION_DETECT     : 16,
  WATCHDOG          : 17,
  ADC_DATA_FRAME    : 18,
  VIDEO_STREAM      : 19,
  GAMES             : 20,
  PRESSURE_RAW      : 21,
  MAGNETO           : 22,
  WIND_SPEED        : 23,
  KALMAN_PRESSURE   : 24,
  HDVIDEO_STREAM    : 25,
  WIFI              : 26,
  ZIMMU_3000        : 27,
  CKS               : 65535
};

constants.CAD_TYPE = {
  HORIZONTAL              : 0,   /*<! Deprecated */
  VERTICAL                : 1,   /*<! Deprecated */
  VISION                  : 2,   /*<! Detection of 2D horizontal tags on drone shells */
  NONE                    : 3,   /*<! Detection disabled */
  COCARDE                 : 4,   /*<! Detects a roundel under the drone */
  ROUNDEL                 : 4,   /*<! Detects a roundel under the drone */
  ORIENTED_COCARDE        : 5,   /*<! Detects an oriented roundel under the drone */
  ORIENTED_ROUNDEL        : 5,   /*<! Detects an oriented roundel under the drone */
  STRIPE                  : 6,   /*<! Detects a uniform stripe on the ground */
  H_COCARDE               : 7,   /*<! Detects a roundel in front of the drone */
  H_ROUNDEL               : 7,   /*<! Detects a roundel in front of the drone */
  H_ORIENTED_COCARDE      : 8,   /*<! Detects an oriented roundel in front of the drone */
  H_ORIENTED_ROUNDEL      : 8,   /*<! Detects an oriented roundel in front of the drone */
  STRIPE_V                : 9,
  MULTIPLE_DETECTION_MODE : 10,  /* The drone uses several detections at the same time */
  CAP                     : 11,  /*<! Detects a Cap orange and green in front of the drone */
  ORIENTED_COCARDE_BW     : 12,  /*<! Detects the black and white roundel */
  ORIENTED_ROUNDEL_BW     : 12,  /*<! Detects the black and white roundel */
  VISION_V2               : 13,  /*<! Detects 2nd version of shell/tag in front of the drone */
  TOWER_SIDE              : 14,  /*<! Detect a tower side with the front camera */
  NUM                     : 15   /*<! Number of possible values for CAD_TYPE */
};

constants.TAG_TYPE = {
  NONE             : 0,
  SHELL_TAG        : 1,
  ROUNDEL          : 2,
  ORIENTED_ROUNDEL : 3,
  STRIPE           : 4,
  CAP              : 5,
  SHELL_TAG_V2     : 6,
  TOWER_SIDE       : 7,
  BLACK_ROUNDEL    : 8,
  NUM              : 9
};

constants.FLYING_MODE = {
  FREE_FLIGHT                      : 0,       /**< Normal mode, commands are enabled */
  HOVER_ON_TOP_OF_ROUNDEL          : 1 << 0,  /**< Commands are disabled, drones hovers on top of a roundel - roundel detection MUST be activated by the user with 'detect_type' configuration. */
  HOVER_ON_TOP_OF_ORIENTED_ROUNDEL : 1 << 1   /**< Commands are disabled, drones hovers on top of an oriented roundel - oriented roundel detection MUST be activated by the user with 'detect_type' configuration. */
};

constants.ARDRONE_DETECTION_COLOR = {
  ORANGE_GREEN       : 1,    /*!< Cameras detect orange-green-orange tags */
  ORANGE_YELLOW      : 2,    /*!< Cameras detect orange-yellow-orange tags*/
  ORANGE_BLUE        : 3,    /*!< Cameras detect orange-blue-orange tags */
  ARRACE_FINISH_LINE : 0x10,
  ARRACE_DONUT       : 0x11
};
