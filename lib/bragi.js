/* =========================================================================
 * Bragi (Javascript Logger - Node)
 *
 * ----------------------------------
 *
 * v1.0.0
 * Distributed under MIT license
 * Author : Erik Hazzard ( http://vasir.net )
 *
 * Provides a LOGGER object which can be used to perform logging
 * Maintains a list of of all messages by log group. To log:
 *      LOGGER.log('group', 'message', param1, param2, etc...);
 *      
 *  e.g.,
 *      LOGGER.log('error', 'Woops', { some: data });
 *
 * To change logger options:
 *      LOGGER.options.logLevel = true; // Shows ALL messages (false to show none)
 *      LOGGER.options.logLevel = ['error', 'debug']; // only shows passed in groups 
 *
 *   LOGGER.options.storeHistory = true or false
 *      NOTE: By default, history will be stored only for logged messages.
 *
 *      Set LOGGER.options.storeAllHistory = true; to enable storing history 
 *      for unlogged messages
 *
 *      To access history:
 *          LOGGER.history[group] to access messages by `group`
 *
 *
 * What this library does currently not support:
 *      Automatically sending the history / log messages to some server. 
 *      Currently, you'll need to take the LOGGER.history object and pipe it
 *      somwhere if you want to access the stored messages
 *
 *      TODO: For node, expose a `useEvents` option that would emit an event
 *      on true, which would allow other libraries to do stuff with the log 
 *      messages??
 * ========================================================================= */
var util = require('util');

var canLog = require('./bragi/canLog');

// Transports is an object which we can add / remove transport objects to
var Transports = require('./bragi/transports/Transports');

// transports is an object containing all available transports
var transports = require('./bragi/transports');

// TODO: This should probably be in the transports
var STYLES = require('./bragi/styles');
var SYMBOLS = require('./bragi/symbols');

// --------------------------------------
//
// Setup logger object
//
// --------------------------------------
// Here, we use only a single LOGGER object which is shared among all files
// which import Bragi. 
// NOTE: Why use a single object? What are benefits? Could expose a "new"
//  logger object

// NOTE: It might be useful to have multiple loggers?
var LOGGER = {
    util: {},
    transports: new Transports(),

    // reference to canLog function
    canLog: canLog
};

// Setup default transports
// --------------------------------------
LOGGER.transports.add( new transports.Console({}) );
//LOGGER.transports.add( new transports.ConsoleJSON({}) );

// Setup line number / function name logging 
// --------------------------------------
LOGGER.util.__stack = function() {
    // Utility to get stack information
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack) { return stack; };
    var err = new Error();
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
};

// note: for __stack() calls we use index 2 to get information about the calling
// item in the stack trace 
LOGGER.util.__line = function(){
    return LOGGER.util.__stack()[2].getLineNumber();
};
LOGGER.util.__column = function(){
    return LOGGER.util.__stack()[2].getColumnNumber();
};
LOGGER.util.__fileName = function(){
    return LOGGER.util.__stack()[2].getFileName();
};

// ----------------------------------
// Expose styles to users
// --------------------------------------
LOGGER.util.colors = STYLES.colors;

// some symbols for the user
LOGGER.util.symbols = SYMBOLS; 

// ----------------------------------
//
// Setup options
//
// ----------------------------------
LOGGER.options = {
    // default options
    // Primary configuration options
    // --------------------------
    // logLevel: specifies what logs to display. Can be either:
    //      1. an {array} of log levels 
    //          e.g,. ['error', 'myLog1', 'myLog2']
    //    or 
    //
    //      2. a {Boolean} : true to see *all* log messages, false to 
    //          see *no* messages
    logLevel: true,

    // storeHistory: {Boolean} specifies wheter to save all log message 
    //      objects.  This is required to send messages to a server, 
    //      but can incur a small performance (memory) hit, depending 
    //      on the number of logs. NOTE: This will, by default, only
    //      store history for messages found in logLevel. 
    //      Set `storeAllHistory` to store *all* messages
    storeHistory: true,

    // How many messages to store in memory for each type
    //  NOTE: Can be `false` or `0` for unlimited history
    historyLimit: 200,

    // storeAllHistory: {Boolean} specifies wheter to store history for
    // all log messages, regardless if they are logged
    storeAllHistory: false,

    // Secondary (display related) configuration options
    // --------------------------
    // showCaller: {Boolean} will automatically include the calling 
    //      function's name. Useful for tracing execution of flow
    showCaller: true,
    // showTime: {Boolean} specifies wheter to include timestamp
    showTime: true,
    // showFullStackTrace: {Boolean} provide the full stack trace? (node only)
    showFullStackTrace: false,

    // showMeta: {Boolean} Show the meta info (calling func, time, line num, etc)
    //  NOTE: This is primarily used only if you want to disable everything.
    //  If this is true, the showCaller, showTime, and showFullStackTrace 
    //  options will be checked. If it is set to false, nothing will be shown
    showMeta: true
};

LOGGER.history = {
    // stored log messages by log group
    // e.g.,:
    // 'logType': [ { ... message 1 ...}, { ... message 2 ... }, ... ]
};

// ----------------------------------
//
// UTIL functions
//
// ----------------------------------
LOGGER.util.print = function print(message, color){
    // Utility function for printing a passed in message and giving it some 
    // color
    return LOGGER.util.colors[color] + message  + LOGGER.util.colors.reset;
};

// ----------------------------------
//
// LOG function
//
// ----------------------------------
LOGGER.log = function loggerLog(group, message){
    // Main logging function. Takes in two (plus n) parameters:
    //   group: {String} specifies the log level, or log group
    //
    //   message: {String} the message to log. The message must be a single
    //      string, but can have multiple objects inside using `%O`. e.g.,
    //          logger.log('test', 'some object: %O', {answer: 42});
    //
    //   all other parameters are objects or strings that will be formatted
    //   into the message
    //
    
    // can this message be logged? If not, do nothing
    if( !canLog(group, LOGGER.options.logLevel) ){ 
        // Can NOT be logged. If the storeAllHistory is set, we'll want
        // to save the history
        if(!LOGGER.options.storeAllHistory){
            return false;
        }
    }

    // get all arguments
    // remove the group and message from the args array, so the new args array will
    // just be an array of the passed in arguments
    var extraArgs = Array.prototype.slice.call(arguments, 2);
    
    // ----------------------------------
    // Build up a `loggedObject`, a structured object containing log 
    // information. It can be output to the console, to another file, to
    // a remote host, etc.
    // ------------------------------
    var loggedObject = {};
    
    // Caller info
    var caller = 'global scope';
    if(loggerLog.caller && loggerLog.caller.name){
        caller = loggerLog.caller.name;
    } else if((loggerLog.caller+'').indexOf('function ()') === 0){
        caller = 'anonymous function'; 
    } 

    // Setup properties on the loggedObject based on passed in properties
    // ----------------------------------
    // These are set before any of our library setters to ensure clients do not
    // override properties set by Bragi
    // NOTE: All properties set by Bragi are prefixed with an underscore
    loggedObject.properties = {};
    
    for(var i=0; i< extraArgs.length; i++){
        // For each argument, we need to check its type. If it's an object, then
        // we'll extend the loggedObject (if there are multiple keys, the last
        // key found takes priority). If it's an array or any other data type,
        // we'll set a new property called `argumentX` and set the value

        if(!(extraArgs[i] instanceof Array) && typeof extraArgs[i] === 'object'){
            for(var key in extraArgs[i]){
                loggedObject.properties[key] = extraArgs[i][key];
            }
        } else {
            loggedObject.properties['_argument' + i] = extraArgs[i];
        }
    }

    // setup meta
    // ----------------------------------
    var stackLen = LOGGER.util.__stack().length;
    var trace = [];
    for(i=1; i < stackLen; i++){
        trace.push(LOGGER.util.__stack()[i] + '');
    }

    loggedObject.meta = {
        caller: caller,
        date: new Date(),
        file: LOGGER.util.__fileName(),
        line: LOGGER.util.__line(),
        column: LOGGER.util.__column(),
        // add the full stack trace
        trace: trace
    };
    loggedObject.unixTimestamp = new Date().getTime() / 1000;

    // Setup group, message, other params
    // ----------------------------------
    loggedObject.group = group;

    // Setup the message
    // ----------------------------------
    // Format the message with the extra args (if set and if needed)
    var utilFormatArgs = [].slice.call(extraArgs);
    utilFormatArgs.unshift(message);
    loggedObject.message = util.format.apply(util, utilFormatArgs);

    
    // Strip colors from message
    // ----------------------------------
    // This must be done for printing plain messages; if users embedded 
    // colors in the message we don't want to show the colors
    // NOTE: Transports can ignore the styledMessage message or use it (e.g., 
    // console transport uses it)
    loggedObject.styledMessage = loggedObject.message;
    for(var color in STYLES.colors){
        loggedObject.message = loggedObject.message.replace(STYLES.colors[color], '');
    }

    // Send loggedObject to each transport
    // ----------------------------------
    var logLevel, curTransport;

    for(var transport in LOGGER.transports.transports){
        curTransport = LOGGER.transports.transports[transport];

        // by default, use the logLevel specified in options. However, use the 
        // transport logLevel if it exists
        logLevel = LOGGER.options.logLevel;
        if(curTransport.logLevel !== undefined){
            logLevel = curTransport.logLevel;
        }

        // check if message can be logged
        if(canLog(loggedObject.group, logLevel)){
            curTransport.log( 
                // first param is object to lob
                loggedObject, 
                // second is this logger's options
                LOGGER.options 
            );
        }
    }

    // Finally, check if it should be added to the history
    // ------------------------------
    if(LOGGER.options.storeHistory || LOGGER.options.storeAllHistory){
        // show the history be stored? if so, store it
        LOGGER.history[group] = LOGGER.history[group] || []; //ensure existence
        LOGGER.history[group].push(loggedObject);

        // make sure history doesn't grow too big. If too big, remove first log 
        if(LOGGER.options.historyLimit > 1){
            if(LOGGER.history[group].length > LOGGER.options.historyLimit){
                LOGGER.history[group].shift();
            }
        }
    }
};

module.exports = LOGGER;
