var df = require('dateformat')
  , fs = require('fs')
  , arDrone = require('ar-drone')
  , arDroneConstants = require('ar-drone/lib/constants')
  , autonomy = require('ardrone-autonomy')
  ;

module.exports = Panorama;
function Panorama(options) {
    options = options || {};

    this._exiting  = false;
    this._altitude = options.altitude || 1.5;
    this._mission  = autonomy.createMission();

    this.configure();
}

Panorama.prototype.reset = function() {
    this._counter = 0;
}

// Configure the drone
Panorama.prototype.configure = function() {
    var mission = this._mission;
    var self = this;

    // From the SDK.
    var navdata_options = (
        navdata_option_mask(arDroneConstants.options.DEMO)
      | navdata_option_mask(arDroneConstants.options.VISION_DETECT)
      | navdata_option_mask(arDroneConstants.options.MAGNETO)
      | navdata_option_mask(arDroneConstants.options.WIFI)
    );

    // Connect and configure the drone
    mission.client().config('general:navdata_demo', true);
    mission.client().config('general:navdata_options', navdata_options);
    mission.client().config('control:altitude_max', 5000);
    mission.client().config('video:video_channel', 0);
    mission.client().config('detect:detect_type', 12);

    // Land on ctrl-c
    process.on('SIGINT', function() {
        if (this._exiting) {
            process.exit(0);
        } else {
            console.log('Got SIGINT. Landing, press Control-C again to force exit.');
            this._exiting = true;
            mission.control().disable();
            mission.client().land(function() {
                process.exit(0);
            });
       }
    });

    // Record images from camera
    mission.client().getPngStream().on('data', function(data){
        self._lastImage = data;
    });

    // Log the mission data to a file
    mission.log("navdata-" + df(new Date(), "yyyy-mm-dd_hh-MM-ss") + ".txt");

    // Function called when taking pictures
    var takePicture = function() {
        var fileName = 'pano_' + self._counter++ + '.png';
        fs.writeFile(fileName, self._lastImage, function(err){
            if (err) console.log(err);
            console.log(fileName + ' Saved');
        });
    };

    // Prepare the mission
    var altitude = this._altitude;
    mission.takeoff()
           .hover(500)
           .go({x:0, y:0})
           .go({x:0, y:0, z:altitude})
           .go({x:0, y:0, z:altitude, yaw:0})
           .taskSync(takePicture)
           .go({x:0, y:0, z:altitude, yaw:45})
           .taskSync(takePicture)
           .go({x:0, y:0, z:altitude, yaw:90})
           .taskSync(takePicture)
           .go({x:0, y:0, z:altitude, yaw:135})
           .taskSync(takePicture)
           .go({x:0, y:0, z:altitude, yaw:180})
           .taskSync(takePicture)
           .go({x:0, y:0, z:altitude, yaw:225})
           .taskSync(takePicture)
           .go({x:0, y:0, z:altitude, yaw:270})
           .taskSync(takePicture)
           .go({x:0, y:0, z:altitude, yaw:315})
           .taskSync(takePicture)
           .go({x:0, y:0, z:altitude, yaw:360})
           .taskSync(takePicture)
           .go({x:0, y:0, z:1})
           .land();
}

// Execute the mission
Panorama.prototype.go = function() {
    // Reset the counters
    this.reset();

    // Run the mission
    console.log("Capturing panorama at %s meters altitude.", this._altitude);
    this._mission.run(function (err, result) {
        if (err) {
            console.trace("Oops, something bad happened: %s", err.message);
            mission.control().disable();
            mission.client().land();
        } else {
            console.log("We are done!");
            process.exit(0);
        }
    });
}

// Helper function
module.exports.go = function(altitude) {
    var pano = new Panorama({altitude: altitude});
    pano.go();
}

// Function to configure navdata
function navdata_option_mask(c) {
  return 1 << c;
}

