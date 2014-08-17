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

    this.filename = options.filename;
    if(!this.filename){
        throw new Error('No filename passed into TransportFile options object');
    }

    // TODO: Add batch writing capabilities (maybe streams / cork() / uncork())
    this.batchSize = 0;

    return this;
}

// Prototype properties (All these must exist to be a valid transport)
// --------------------------------------
TransportFile.prototype.name = 'File';

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
    // TODO: use streams or  buffer or timer to batch write to file, don't write 
    // on every log
    var fs = require('fs');

    // TODO: add formatting options, other ways to write 
    if(this.filename){
        fs.appendFile(
            this.filename, 
            JSON.stringify(loggedObject, null, 4) + '\n', 
            function finishedWriting(err) {}
        );
    }

    return this;
};

module.exports = TransportFile;
