/* =========================================================================
 *
 * History
 *      Logs to console, but just outputs raw JSON
 *
 * ========================================================================= */
function TransportHistory ( options ){
    options = options || {};

    this.groupsEnabled = options.groupsEnabled;
    this.groupsDisabled = options.groupsDisabled;

    // Store *everything*?
    this.storeEverything = false;
    if(options.storeEverything === true){
        this.storeEverything = true;

        // Also, log *everything*
        this.groupsEnabled = true;
    }

    // Set history size per log group
    //  NOTE: if historySize is 0 or false, it has no limit
    this.historySize = options.historySize !== undefined ? options.historySize : 200;

    // History object
    this.history = {};

    return this;
}

// Prototype properties (All these must exist to be a valid transport)
// --------------------------------------
TransportHistory.prototype.name = 'History';

TransportHistory.prototype.log = function transportHistoryLog( loggedObject ){
    // log
    //  Logs a passed object to the console
    //
    //  params:
    //      loggedObject: {Object} the log object to log
    //      options : {Object} the logger options
    //
    // Setup message for console output
    // ------------------------------
    //  The final message will just be a JSON printed string

    // Keep track of message
    if(this.history[loggedObject.group] === undefined){
        this.history[loggedObject.group] = [];
    }
    this.history[loggedObject.group].push(loggedObject);

    // Trim history
    if(this.historySize > 0 && 
       this.history[loggedObject.group].length > this.historySize
    ){
        this.history[loggedObject.group].shift();
    }

    return this;
};

module.exports = TransportHistory;
