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
    this._pictures = options.pictures || 8;
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
        if (self._exiting) {
            process.exit(0);
        } else {
            console.log('Got SIGINT. Landing, press Control-C again to force exit.');
            self._exiting = true;
            mission.control().disable();
            setTimeout(function() {
                console.log("Landing drone.");
                mission.client().land(function() {
                    process.exit(0);
                });
            }, 1000);
       }
    });

    // Record images from camera
    var pngStream = mission.client().getPngStream();
    pngStream.on('data', function(data){
                self._lastImage = data;
              })
              .on('error', function(error){
                console.log("PngEncoder error: %s", error);
              });

    // Log the mission data to a file
    mission.log("navdata-" + df(new Date(), "yyyy-mm-dd_hh-MM-ss") + ".txt");

    // Function called when taking pictures
    var takePicture = function(callback) {

        // First we disable the control to have the drone in stable
        // hover mode
        mission.control().disable();

        // Wait for a new image
        setTimeout(function() {
            mission.client().getPngStream().once('data', function(data) {
                var fileName = 'pano_' + self._counter++ + '.png';
                // Save the file
                fs.writeFile(fileName, data, function(err){
                    if (err) console.log(err);
                    console.log(fileName + ' Saved');

                    // Renable the control
                    callback();
                });
            });
        }, 1000);
    };

    // Prepare the mission
    var altitude = this._altitude;
    var angle = Math.round(360/this._pictures);
    mission.takeoff()
           .hover(500)
           .go({x:0, y:0})
           .altitude(altitude)

    for (var i = 0; i <= this._pictures; i++) {
           mission.task(takePicture)
                  .cw(angle)
    }

    mission.go({x:0, y:0})
           .go({x:0, y:0, z:1})
           .land();
}

// Execute the mission
Panorama.prototype.go = function() {
    var self = this;
    var mission = this._mission;

    // Reset the counters
    this.reset();

    // Ftrim
    console.log("Recalibrating gyros... waiting 5 seconds.");
    this._mission.client().ftrim();

    // Run the mission
    setTimeout(function() {
        console.log("Capturing %d pictures panorama at %s meters altitude.", self._pictures, self._altitude);
        mission.run(function (err, result) {
            if (err) {
                console.trace("Oops, something bad happened: %s", err.message);
                mission.control().disable();
                setTimeout(function() {
                    mission.client().land(function() {
                        console.log("Emergency landed.");
                        process.exit(-1);
                    });
                }, 1000);
            } else {
                console.log("We are done!");
                process.exit(0);
            }
        });
    }, 5000);
}

// Helper function
module.exports.go = function(altitude, pictures) {
    var pano = new Panorama({altitude: altitude, pictures: pictures});
    pano.go();
}

// Function to configure navdata
function navdata_option_mask(c) {
  return 1 << c;
}

