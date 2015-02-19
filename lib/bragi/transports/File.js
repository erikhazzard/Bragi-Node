/* =========================================================================
 *
 * File
 *      Logs to a file
 *
 * ========================================================================= */
var fs = require('fs');

function TransportFile ( options ){
    options = options || {};
    this.groupsEnabled = options.groupsEnabled;
    this.groupsDisabled = options.groupsDisabled;

    this.filename = options.fileName || options.filename;
    if(!this.filename){
        throw new Error('No filename passed into TransportFile options object');
    }

    // TODO: configure format
    this.format = options.format || 'JSON';

    // TODO: Add batch writing capabilities (maybe streams / cork() / uncork())
    this.bufferSize = options.bufferSize || 50;
    this.writeTimeout = options.writeTimeout || 100;

    this._buffer = [];
    return this;
}

// Prototype properties (All these must exist to be a valid transport)
// --------------------------------------
TransportFile.prototype.name = 'File';

TransportFile.prototype.write = function write (){
    // util to write to file
    
    // add an empty string to add an empty newline
    this._buffer.push('');

    fs.appendFile(
        this.filename, 
        this._buffer.join('\n'),
        function finishedWriting(err) {}
    );

    //immediately clear buffer
    this._buffer = [];
    if(this._writeTimeout){
        clearTimeout(this._writeTimeout);
    }
};

TransportFile.prototype.log = function fileLog( loggedObject ){
    // log
    //  Logs a passed object to the console
    //
    //  params:
    //      loggedObject: {Object} the log object to log
    //      options : {Object} the logger options
    //
    // This will write the log to a file
    //
    // TODO : Could potentially optimize with streams
    //
    var self = this;
    var fs = require('fs');

    // log certain parts of the message
    if(this.format === 'JSON'){
        this._buffer.push( JSON.stringify({
            group: loggedObject.group,
            message: loggedObject.message,
            unixTimestamp: loggedObject.unixTimestamp,
            properties: loggedObject.properties
        }, null, 4) );

    } else if (typeof this.format === 'function') {
		// custom formatter function
		this._buffer.push(this.format(loggedObject));
	} else {
        // Non JSON format. 
        // TODO: allow formatting options
        //
        this._buffer.push( 
            "[ " + loggedObject.group + " ] " +
            "{" + loggedObject.unixTimestamp + "}\t" +
            loggedObject.message
        );
    }

    // force writes after some number of logs
    if(this._buffer.length > this.bufferSize){
        this.write();
    }
    // set a small timeout to force a write
    this._writeTimeout = setTimeout(
        function(){ self.write.call(self); }, 
        this.writeTimeout
    );

    return this;
};

module.exports = TransportFile;
