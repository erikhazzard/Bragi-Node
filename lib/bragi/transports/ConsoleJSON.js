/* =========================================================================
 *
 * ConsoleJSON
 *      Logs to console, but just outputs raw JSON
 *
 * ========================================================================= */

function TransportConsoleJSON ( options ){
    // Must allow logLevel to be passed in to allow control of logLevel by
    // transport
    this.logLevel = options.logLevel;

    // Optional, transport specific
    this.spacing = options.spacing === undefined ? 4 : options.spacing;
    return this;
}

// Prototype properties (All these must exist to be a valid transport)
// --------------------------------------
TransportConsoleJSON.prototype.name = 'ConsoleJSON';

TransportConsoleJSON.prototype.log = function transportConsoleJSONLog( loggedObject, loggerOptions ){
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

    console.log( JSON.stringify(loggedObject, null, this.spacing) );

    return this;
};

module.exports = TransportConsoleJSON;
