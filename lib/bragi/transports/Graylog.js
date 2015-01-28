/* =========================================================================
 *
 * Graylog
 *      Graylog transport
 *
 *  TODO: BATCH SENDING
 *
 * ========================================================================= */
var STYLES = require('../styles');
var SYMBOLS = require('../symbols');

// To send data to graylog over UDP
var zlib = require('zlib');
var util = require('util');
var os = require('os');
var dgram = require('dgram');
var net = require('net');
var dns = require('dns');

var HOST_NAME = os.hostname();

function TransportGraylog ( options ){
    var that = this;
    options = options || {};

    // Transport must set groupsEnabled and groupsDisabled to provide transport 
    // level support for overriding what groups to log
    // (NOTE - the user does not need to pass in groupsEnabled, but the 
    // transport must set these properties)
    this.groupsEnabled = options.groupsEnabled;
    this.groupsDisabled = options.groupsDisabled;

    // Transport specific
    if(!options.host){ 
        console.error(
            STYLES.backgrounds.red + STYLES.colors.white +
            'ERROR: Graylog Host must be provided' +
            STYLES.colors.reset
        );
    }
    this.host = options.host;
    this.port = options.port || 12202;
    this.fromHostname = options.fromHostname || HOST_NAME;

    this.version = options.version || '1.0';
    this.facility = options.facility || 'node.js';
    this.service = options.service || 'api';

    // ADDITIONAL OPTIONS to send with every request
    this.additionalOptions = options.additionalOptions || {};

    // ADVANCED Params:
    // max chunk size = 8192
    this.chunkSize = options.chunkSize || 1100;
    this.dataSequence = options.dataSequence === undefined ? 0 : options.dataSequence;

	if (!net.isIPv4(this.host)) {
        // resolve IP address
        dns.resolve4(that.host, function resolved(dnsErr, address) {
            if (dnsErr) { 
                console.error(
                    STYLES.backgrounds.red + STYLES.colors.white +
                    'ERROR: Graylog Host could not be resolved' + 
                    STYLES.colors.reset
                );
                return false;
            }

            // store the address
            that.address = address[0];
        });

    } else {
        this.address = this.host;
    } 

    return this;
}

// Prototype properties (All these must exist to be a valid transport)
// --------------------------------------
TransportGraylog.prototype.name = 'Graylog';

TransportGraylog.prototype.log = function transportGraylogLog( loggedObject ){
    //  log
    //  Logs a passed object to the console
    //
    //  params:
    //      loggedObject: {Object} the log object to log
    //
    // Setup message for console output
    // ------------------------------
    //  The final message will just be a JSON printed string
    var that = this;

    if(!this.address){
        console.log(
            STYLES.colors.grey + 
            'Graylog transport does not have an address (may not be resolved yet)' +
            STYLES.colors.reset
        );
        return false;
    }
    
    // setup graylog level
    var graylogLevel = 6;
    if(loggedObject.group.indexOf('error') === 0){ graylogLevel = 3; } 
    else if(loggedObject.group.indexOf('warn') === 0) { graylogLevel = 4; }

    // other variables
    var message;
    var baseGroup = loggedObject.group.match(/^(.*):/);
    if(!baseGroup){ baseGroup = loggedObject.group; }
    else { baseGroup = baseGroup[1]+''; }

    // setup data
    var dataToSend = {
        timestamp: loggedObject.unixTimestamp || (new Date().getTime()/1000) >> 0,
        host: this.fromHostname,
        group: loggedObject.group,
        baseGroup: baseGroup,
        level: graylogLevel, 
        facility: this.facility,
        service: this.service,
        version: this.version
    };

    // Add any additional options
    Object.keys(that.additionalOptions).forEach( function ( prop ) {
        if ( typeof dataToSend[prop] === 'undefined') { 
            dataToSend[prop] = that.additionalOptions[prop];
        }
    });

	// Add global additional fields to the message
	var dataFromLog = loggedObject.properties;
    Object.keys(dataFromLog).forEach( function ( prop ) {
        if ( typeof dataToSend[prop] === 'undefined') { 
            dataToSend[prop] = dataFromLog[prop];
        }
    });

    // Include stack info if in error
    if(graylogLevel !== 6){
        dataToSend.meta = loggedObject.meta;
    }

    // keep track for sequence counts
    if (this.dataSequence) { dataToSend._logSequence = this.dataSequence++; }

    // setup message
	dataToSend.short_message = loggedObject.message;

    // build up the message
	message = new Buffer(JSON.stringify(dataToSend));

    // compress the message
    zlib.deflate(
        message, 
        function deflated(err, compressedMessage) {
            if (err) { return false; }

            // create socket - client
            var graylogClient = dgram.createSocket("udp4");

	        var sendFunc = that.sendSingle;

            // if the message is too big, chunk it
            if (compressedMessage.length > that.chunkSize) {
                sendFunc = that.sendChunked;
            }

            // call the func
            sendFunc.call(that, graylogClient, compressedMessage);
        });


    return this;
};

// ======================================
// 
// Util Functions for graylog 
//
// ======================================
TransportGraylog.prototype.sendChunked = function sendChunked(graylogClient, compressedMessage) {
    var that = this;

	var messageId = ''+(Date.now() + (Math.random()*100000 | 0));
	var sequenceSize = Math.ceil(
        compressedMessage.length / this.chunkSize
    );
    var byteOffset = 0;
    var chunksWritten = 0;
    var sequence = 0;
    var chunkBytes, chunk;

    if (sequenceSize > 128) {
        console.log("Error: sequence size is too big");
        return false;
    }

    var sentChunkFunc = function sentChunkFunc(err, byteCount) {
        // after chunk has been written, this callback is called, and if
        // we're done then close the graylog connection
        chunksWritten++;
        if (chunksWritten == sequenceSize) {
            graylogClient.close();
        }
    };

	for( sequence=0; sequence < sequenceSize; sequence++ ) {
        chunkBytes = (byteOffset + this.chunkSize) < compressedMessage.length ? this.chunkSize : (compressedMessage.length - byteOffset);

        // create buffer to send
        chunk = new Buffer(chunkBytes + 12);

        chunk[0] = 0x1e;
        chunk[1] = 0x0f;
        chunk.write(messageId, 2, 8, 'ascii');
        chunk[10] = sequence;
        chunk[11] = sequenceSize;

        compressedMessage.copy(chunk, 12, byteOffset, byteOffset+chunkBytes);

        byteOffset += chunkBytes;

        // send it to graylog
        graylogClient.send(
            chunk, 0, chunk.length, 
            that.port, that.address, 
            sentChunkFunc
        );
	}
};

TransportGraylog.prototype.sendSingle = function sendSingle(graylogClient, compressedMessage) {
    var that = this;

	graylogClient.send(
        compressedMessage, 0, compressedMessage.length, 
        this.port, this.address, 
        function sentData(err, byteCount) {
            graylogClient.close();
        });
};

// ======================================
//
// All done
//
// ======================================
module.exports = TransportGraylog;
