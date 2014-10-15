// Graylog2.js: Transport for outputting logs over UDP to Graylog2
// This module is inspired by https://github.com/flite/winston-graylog2
// It extends it to fit the Bragi logging structure.
//
// Example call: 
//
//
//    logger.transports.add( new graylog2Transport( {
//
//         graylogHost: 'localhost',
//         graylogPort: '12204',
//         graylogFacility: 'someServicename'
//     } ) );
//
// TODO: Handle log levels better
// TODO: Think about what meta information to sent to Graylog2
//
var util = require('util'),
    logger = require('bragi'),
    dgram = require('dgram');


function Graylog2(options) {
    options = options || {};

    // Transport must set groupsEnabled and groupsDisabled to provide transport 
    // level support for overriding what groups to log
    // (NOTE - the user does not need to pass in groupsEnabled, but the 
    // transport must set these properties)
    this.groupsEnabled = options.groupsEnabled;
    this.groupsDisabled = options.groupsDisabled;

    // Transport specific settings
    // ------------------------------
    this.spacing = options.spacing === undefined ? 4 : options.spacing;

    // Creating a udp client
    this.udpClient = dgram.createSocket('udp4');

    this.udpClient.on('error', function(err) {
        // Handle any suprise errors
        util.error(err);
    });

    this.graylogHost = options.graylogHost || 'localhost';
    this.graylogPort = options.graylogPort || 12201;
    this.graylogHostname = options.graylogHostname || require('os').hostname();
    this.graylogFacility = options.graylogFacility || 'nodejs';
    this.graylogSequence = 0;
    this.host = options.host || 'localhost';

    return this;
}

Graylog2.prototype.name = 'Graylog2';

Graylog2.prototype.log = function graylog2Log(loggedObject) {

    var self = this,
        message = {},
        key;

    var message = {
        "version": "1.1",
        "host": self.host,
        "short_message": loggedObject.message,
        "full_message": JSON.stringify(loggedObject.message),
        "level": 1,
        "facility": self.graylogFacility,
        "_group": loggedObject.group,
        "_unixTimestamp": loggedObject.unixTimestamp,
        "_file": loggedObject.file,
        "_caller": loggedObject.caller,
        "_line": loggedObject.line

    };

    var grayLogMessage = new Buffer(JSON.stringify(message));

    if (grayLogMessage.length > 8192) {
        return throw new Error("Log message size > 8192 bytes not supported.");
    }

    this.udpClient.send(grayLogMessage, 0, grayLogMessage.length, self.graylogPort, self.graylogHost, function(err, bytes) {
        if (err) {
            console.log("Error sending log message to graylog2", err);
        }

    });


    return this;
};

module.exports = Graylog2;