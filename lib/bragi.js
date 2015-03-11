/* =========================================================================
 * Bragi (Javascript Logger - Node)
 *
 * ----------------------------------
 *
 * Distributed under MIT license
 *
 * Provides a LOGGER object which can be used to perform logging
 *      LOGGER.log('group1', 'hello world');
 *
 *      // Also, parasm can be passed in
 *      LOGGER.log('group1', 'message', param1, param2, etc...);
 *      
 *      // And subgroups can be logged
 *      LOGGER.log('group1:subgroup', 'message %j', param1); 
 *      
 * To change logger options:
 *      // Shows ALL messages (false to show none)
 *      LOGGER.options.groupsEnabled = true; 
 *
 *      // Shows only specific groups
 *      LOGGER.options.groupsEnabled = ['error', 'debug']; // only shows passed in groups 
 *
 *      // Can also filter on subgroups
 *      LOGGER.options.groupsEnabled = ['group1:subgroup1']; 
 *
 *      // Or regular expressions
 *      LOGGER.options.groupsEnabled = [/^start:to:end$/]
 *
 * To change storing stack traces (gives more info, but adds a nontrivial amount 
 *      of time), change the `storeStackTrace` property. It is `false` by default
 *
 *      LOGGER.options.storeStackTrace = true;
 *
 * TRANSPORTS
 *      Logs are output / written to a file / pipped to a server by means
 *      of transports
 *
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

var REMOVE_COLOR_REGEX = /\033\[[0-9;]*m/g;

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

    // reference to canLog function
    canLog: canLog
};

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

// --------------------------------------
// Expose styles to users
// --------------------------------------
LOGGER.util.colors = STYLES.colors;

// some symbols for the user
LOGGER.util.symbols = SYMBOLS; 

// --------------------------------------
//
// Setup options
//
// --------------------------------------
LOGGER.options = {
    // default options
    // Primary configuration options
    // ----------------------------------
    // groupsEnabled: specifies what logs to display. Can be either:
    //      1. an {array} of log levels 
    //          e.g,. ['error', 'myLog1', 'myLog2']
    //    or 
    //
    //      2. a {Boolean} : true to see *all* log messages, false to 
    //          see *no* messages
    //
    // groupsEnabled acts as a "whitelist" for what messages to log
    groupsEnabled: true,

    // blackList is an array of log level groups which will always be excluded.
    // Levels specified here take priority over log groups specified in groupsEnabled
    groupsDisabled: [],


    // Store the stack info - calling function, file name, line number, and
    // column. True by default. Adds a marginal amount of overhead, but can
    // be disabled for production
    storeStack: true,

    // Store the stack *trace*? Provides the full stack trace, but adds
    // significant overhead. Useful for development, should likely
    // be disabled for production
    // when in development, tradeoffs should be considered when in production
    storeStackTrace: false
};


// Setup default transports
// --------------------------------------
// transports is the transports array the logger users. 
LOGGER.transports = new Transports();

// Default transports
// ----------------------------------
// NOTE:  see the Console transport for info on the configuration options.
// NOTE: Do not 
var _defaultTransports = [
    new transports.Console({
        showMeta: true, 
        showStackTrace: false
    })
];

// Other transports include:
//      new transports.ConsoleJSON({}) 
//      
//      new transports.History({
//          storeEverything: false
//      }) 
//
//      new transports.File({
//          filename: '/tmp/test.json'
//         })

for(var i=0; i < _defaultTransports.length; i++){
    LOGGER.transports.add( _defaultTransports[i] );
}

// Expose a reference to all available transports
// NOTE: This isn't the cleanest way to do this, could use improvement
LOGGER.transportClasses = transports;

// ----------------------------------
//
// Group Addition / Removal Functions
//
// ----------------------------------
LOGGER.addGroup = function addGroup ( group ){
    // Add a passed in group (either a {String} or {RegExp}) to the 
    // groupsEnabled array
    
    // If groupsEnabled is true or false, turn it into an array
    var groupsEnabled = LOGGER.options.groupsEnabled;

    if(groupsEnabled === true || groupsEnabled === false){
        LOGGER.options.groupsEnabled = groupsEnabled = [];
    }

    // Ensure it does not exist
    var i=0, len=groupsEnabled.length;
    for(i=0;i<len;i++){
        if(groupsEnabled[i].toString() === group.toString()){
            return LOGGER;
        }
    }

    // Group wasn't found yet, add it
    groupsEnabled.push( group );

    return LOGGER;
};

LOGGER.removeGroup = function removeGroup ( group ){
    // Takes in a group and removes all occurences of it from 
    // groupsEnabled
    
    // If groupsEnabled is true or false, turn it into an array
    var groupsEnabled = LOGGER.options.groupsEnabled;

    if(groupsEnabled === true || groupsEnabled === false){
        LOGGER.options.groupsEnabled = groupsEnabled = [];
    }

    // Ensure it does not exist
    var i=0, len=groupsEnabled.length;
    var groupsEnabledWithoutGroup = [];

    for(i=0;i<len;i++){
        if(groupsEnabled[i].toString() !== group.toString()){
            groupsEnabledWithoutGroup.push( groupsEnabled[i] );
        }
    }

    // update the groupsEnabled
    LOGGER.options.groupsEnabled = groupsEnabledWithoutGroup;

    return LOGGER;
};

// ----------------------------------
//
// UTIL functions
//
// ----------------------------------
LOGGER.util.print = function print(message, color){
    // Utility function for printing a passed in message and giving it some 
    // color
    //
    // Color can be any one of 'red', 'white',', 'grey', 'black', 'blue',
    // 'cyan', 'green', 'magenta', 'red', or 'yellow',
    //
    // It returns a string that is colored based on the passed in color
    // 
    // If no color was passed in, use black
    color = color ? color : 'black';

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
    var groupsEnabled, groupsDisabled, currentTransport;
    var transportFuncsToCall = [];

    // Check if this can be logged or not. All transports must be checked as
    // well, as they can override LOGGER.options.groupsEnabled 
    // ----------------------------------
    // For each transport, if it can be logged, log it
    for(var transport in LOGGER.transports._transports){
        currentTransport = LOGGER.transports._transports[transport];

        // by default, use the groupsEnabled and groupsDisabled specified in 
        // options
        groupsEnabled = LOGGER.options.groupsEnabled;
        groupsDisabled = LOGGER.options.groupsDisabled;

        // If transport overrides exist, use them
        if(currentTransport.groupsEnabled !== undefined){
            groupsEnabled = currentTransport.groupsEnabled;
        }
        if(currentTransport.groupsDisabled !== undefined){
            groupsDisabled = currentTransport.groupsDisabled;
        }

        // check if message can be logged
        if(canLog(group, groupsEnabled, groupsDisabled)){
            transportFuncsToCall.push( currentTransport );
        }
    }

    // can this message be logged? If not, do nothing
    if(transportFuncsToCall.length < 1){ 
        // Can NOT be logged if there are no transportFuncs to call 
        //
        // If storeAllHistory is not true, return immediately (if it is
        // true, the message will get stored just not passed to any
        // transports)
        if(!LOGGER.options.storeAllHistory){
            return false;
        }
    }

    // get all arguments
    // ----------------------------------
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
    var caller = null;

    // Setup properties on the loggedObject based on passed in properties
    // ----------------------------------
    // These are set before any of our library setters to ensure clients do not
    // override properties set by Bragi
    // NOTE: All properties set by Bragi are prefixed with an underscore
    loggedObject.properties = {};
    
    for(var i=0; i< extraArgs.length; i++){
        // For each argument, we need to check its type. If it's an object, then
        // we'll extend the loggedObject `properties` object 
        // (if there are multiple keys, the last
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
    loggedObject.meta = {
        caller: caller,
        date: new Date().toJSON()
    };
    loggedObject.unixTimestamp = new Date().getTime() / 1000;

    // Store more meta - stack info
    var stack = [], stackLength = 0;

    if(LOGGER.options.storeStack || LOGGER.options.storeStackTrace){
        stack = LOGGER.util.__stack();
        stackLength = stack.length;
        
        loggedObject.meta.file = stack[1].getFileName();
        loggedObject.meta.line = stack[1].getLineNumber();
        loggedObject.meta.column = stack[1].getColumnNumber();
        loggedObject.meta.caller = stack[1].getFunctionName();
    }

    if(LOGGER.options.storeStackTrace){
        // Stores the *full* stack trace. This adds significant overhead
        // and should likely not be used in production
        var trace = [];

        for(i=1; i < stack.length; i++){
            trace.push(stack[i] + '');
        }
        loggedObject.meta.trace = trace;
    }

    // Setup group, message, other params
    // ----------------------------------
    loggedObject.group = group;

    // Setup the message
    // ----------------------------------
    // Format the message with the extra args (if set and if needed)
    var tmpVal;
    var utilFormatArgs = [];

    // only format as many args that have been passed in
    // use the lower and upper case versions of legit formatters (j,s,d) 
    //  from http://nodejs.org/docs/latest/api/util.html#util_util_format_format
    //  and also use %o / %O which chrome supports
    //  NOTE that the upper case versions will REMOVE the %J|S|D|O in 
    //  and add the corresponding argument to the console log call. 
    //  This can be useful if you want to include the object at the end but 
    //  DON'T want it to be JSON-ified
    var numOfFormatters = (''+message).match(/%([Jj]|[Ss]|[Dd]|[Oo])/g);
    numOfFormatters = numOfFormatters ? numOfFormatters.length : 0;

    for(var tmpArg in extraArgs){
        tmpVal = extraArgs[tmpArg];
        if(tmpVal === undefined){ tmpVal = 'undefined'; }

        if(tmpVal && !tmpVal._hide && utilFormatArgs.length < numOfFormatters){
            utilFormatArgs.push(extraArgs[tmpArg]);
        }
    }

    // add message to the start of the array so it can be formatted with the
    // passed in args
    utilFormatArgs.unshift(message);
    loggedObject.message = util.format.apply(util, utilFormatArgs);

    // remove the capital version of the formatters
    loggedObject.message = loggedObject.message
        .replace(/%(J|S|D|O)/g, '');

    // Strip colors from message
    // ----------------------------------
    // This must be done for printing plain messages; if users embedded 
    // colors in the message we don't want to show the colors
    // NOTE: Transports can ignore the styledMessage message or use it (e.g., 
    // console transport uses it)
    loggedObject.styledMessage = loggedObject.message;

    // replace all colors
    loggedObject.message = loggedObject.message.replace(REMOVE_COLOR_REGEX, '');

    // Send loggedObject to each transport
    // ----------------------------------
    // The loggedObject is setup now, call each of the transport log calls that
    // can be called
    for(i=0, len=transportFuncsToCall.length; i<len; i++){
        transportFuncsToCall[i].log.call( 
            transportFuncsToCall[i], 
            loggedObject 
        );
    }
};

module.exports = LOGGER;
