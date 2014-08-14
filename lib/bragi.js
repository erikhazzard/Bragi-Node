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
 * Maintains a list of of all messages by log type. To log:
 *      LOGGER.log('type', 'message', param1, param2, etc...);
 *      
 *  e.g.,
 *      LOGGER.log('error', 'Woops', { some: data });
 *
 * To change logger options:
 *      LOGGER.options.logLevel = true; // Shows ALL messages (false to show none)
 *      LOGGER.options.logLevel = ['error', 'debug']; // only shows passed in types 
 *
 *   LOGGER.options.storeHistory = true or false
 *      NOTE: By default, history will be stored only for logged messages.
 *
 *      Set LOGGER.options.storeAllHistory = true; to enable storing history 
 *      for unlogged messages
 *
 *      To access history:
 *          LOGGER.history[type] to access messages by `type`
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
var LOGGER = {
    util: {}
};

// ----------------------------------
//
// Setup line number / function name logging if in node
//
// ----------------------------------
// v8 options:
// getThis, getTypeName, getFunction, getFunctionName, getMethodName, 
//  getFileName, getLineNumber, getColumnNumber, getEvalOrigin, 
//  isToplevel, isEval, isNative, isConstructor

LOGGER.util.__stack = function() {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack) { return stack; };
    var err = new Error();
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
};

// Note: use 2, as this is the index of the previous caller
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
//
// Setup colors
//
// ----------------------------------
var GROUP_COLORS, STYLES;
var COLOR_RESET = '\033[0m';
STYLES = {
    colors: {
        white: '\x1B[37m',
        grey: '\x1B[90m',
        black: '\x1B[30m',
        blue: '\x1B[34m',
        cyan: '\x1B[36m',
        green: '\x1B[32m',
        magenta: '\x1B[35m',
        red: '\x1B[31m',
        yellow: '\x1B[33m',
        reset: '\033[0m'
    },
    styles: {
        blink: '\x1B[49;5;8m',
        underline: '\x1B[4m', 
        bold: '\x1B[1m'
    },
    backgrounds: {
        white: '\x1B[47m',
        black: '\x1B[40m',
        blue: '\x1B[44m',
        cyan: '\x1B[46m',
        green: '\x1B[42m',
        magenta: '\x1B[45m',
        red: '\x1B[41m',
        yellow: '\x1B[43m'
    }
};


// Expose styles to users
// --------------------------------------
LOGGER.util.colors = STYLES.colors;

// some symbols for the user
LOGGER.util.symbols = {
    success: STYLES.colors.green + '✔︎ ' + COLOR_RESET,
    error: STYLES.colors.red + '✘ ' + COLOR_RESET,
    arrow: '➤ ',
    star: '☆ ',
    box: STYLES.colors.yellow + '☐ ' + COLOR_RESET,
    boxSuccess: STYLES.colors.green + '☑︎ ' + COLOR_RESET,
    boxError: STYLES.colors.red + '☒ ' + COLOR_RESET,
    circle: '◯ ',
    circleFilled: '◉ '
};

// --------------------------------------
//
// Setup group Colors to print
//
// --------------------------------------
GROUP_COLORS = [
    STYLES.colors.blue,
    STYLES.colors.magenta,
    STYLES.colors.green,
    STYLES.colors.yellow,
    STYLES.colors.cyan,
    STYLES.colors.red,

    STYLES.backgrounds.blue + STYLES.colors.black,
    STYLES.backgrounds.blue + STYLES.colors.white,
    STYLES.backgrounds.blue + STYLES.colors.magenta,

    STYLES.backgrounds.yellow + STYLES.colors.red,
    STYLES.backgrounds.yellow + STYLES.colors.black,
    STYLES.backgrounds.yellow + STYLES.colors.magenta,

    STYLES.backgrounds.white + STYLES.colors.red,
    STYLES.backgrounds.white + STYLES.colors.blue,
    STYLES.backgrounds.white + STYLES.colors.black,
    STYLES.backgrounds.white + STYLES.colors.magenta,
    STYLES.backgrounds.white + STYLES.colors.yellow,
    STYLES.backgrounds.white + STYLES.colors.cyan,

    STYLES.backgrounds.magenta+ STYLES.colors.white,
    STYLES.backgrounds.magenta + STYLES.colors.black,
    STYLES.backgrounds.magenta + STYLES.colors.blue,
    STYLES.backgrounds.magenta + STYLES.colors.green,
        STYLES.backgrounds.magenta + STYLES.colors.yellow
];

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
    // stored log messages by log type
    // e.g.,:
    // 'logType': [ { ... message 1 ...}, { ... message 2 ... }, ... ]
};

LOGGER.canLog = function canLog(type){ 
    // Check the logLevels and passed in type. If the message cannot be
    // logged, return false - otherwise, return true
    var logLevel = LOGGER.options.logLevel;
    // by default, allow logging
    var canLogIt = true;

    if(logLevel === true){
        canLogIt = true;

    } else if(logLevel === false || logLevel === null){
        // Don't ever log if logging is disabled
        canLogIt = false;

    } else if(logLevel instanceof Array){
        // if an array of log levels is set, check it
        canLogIt = false;

        for(var i=0, len=logLevel.length; i<len; i++){
            // the current logLevel will be a string we check type against;
            // for instance,
            //      if type is "group1:group2", and if the current log level
            //      is "group1:group3", it will NOT match; but, "group1:group2" 
            //      would match.
            //          Likewise, "group1:group2:group3" WOULD match
            if(type.indexOf(logLevel[i]) === 0){
                canLogIt = true;
                break;
            }
        }
    } 

    return canLogIt;
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

// keeps track of colors being used. Uses a redundent array for quicker
// lookup
var _foundColors = [];
var _colorDict = { 
    error: STYLES.styles.blink + STYLES.backgrounds.red + STYLES.colors.white,
    warn: STYLES.styles.blink + STYLES.backgrounds.yellow + STYLES.colors.white 
};

function getColor(type){
    // Returns the background color for a passed in log type
    // TODO: if more found colors exist than the original length of the
    // COLOR array, cycle back and modify the original color
    //
    var color = '';

    // For color, get the first group
    type = type.split(':')[0];

    // if a color exists for the passed in log group, use it
    if(_colorDict[type]){ 
        return _colorDict[type];
    }

    if(_foundColors.length >= GROUP_COLORS.length){
        // is the index too high? loop around if so
        color = GROUP_COLORS[Math.random() * GROUP_COLORS.length | 0];
        // Add underline
        color = STYLES.styles.underline + color;
    } else {
        // The length of the colors array is >= to the index of the color
        color = GROUP_COLORS[_foundColors.length];
    }

    // update the stored color info
    _foundColors.push(color);
    _colorDict[type] = color;

    return color;
}

// ----------------------------------
//
// LOG function
//
// ----------------------------------
LOGGER.log = function loggerLog(type, message){
    // Main logging function. Takes in two (plus n) parameters:
    //   type: {String} specifies the log level, or log type
    //
    //   message: {String} the message to log. The message must be a single
    //      string, but can have multiple objects inside using `%O`. e.g.,
    //          logger.log('test', 'some object: %O', {answer: 42});
    //
    //   all other parameters are objects or strings that will be formatted
    //   into the message
    
    // can this message be logged? If not, do nothing
    if( !LOGGER.canLog(type) ){ 
        // Can NOT be logged. If the storeAllHistory is set, we'll want
        // to save the history
        if(!LOGGER.options.storeAllHistory){
            return false;
        }
    }
    
    // get all arguments
    var extraArgs = Array.prototype.slice.call(arguments, 2);
    // remove the type from the args array, so the new args array will
    // just be an array of the message string and any formatted objects
    // to pass into it

    // Setup the log
    // ------------------------------
    // Format the message
    // the final log array should look like:
    //  [ "%c `type` : `message` ", `formatString`, formatting objects ... ]
    var finalLog = [];

    // Logger
    // ------------------------------
    // Include some meta info (time, function that called, etc.)
    if(LOGGER.options.showMeta){
        message += '\n  ' + STYLES.colors.grey;

        // Show the name of the calling function
        if(LOGGER.options.showCaller){

            if(loggerLog.caller && loggerLog.caller.name){
                // Best case - calling function is named
                message += 'caller: ' + loggerLog.caller.name + '() \t ';

            } else { 
                // Calling function is not named OR is called from the global
                // scope. If the function name starts with "function ()", it 
                // means this is called from an anonymous function
                if((loggerLog.caller+'').indexOf('function ()') === 0){
                    message += 'caller: anonymous function  \t ';
                } else {
                    message += 'caller: global scope        \t ';
                }
            }
        } 
        if(LOGGER.options.showTime){
            // JSON timestamp
            message += new Date().toJSON() + ' \t ';
        }

        // For node, log line number and filename
        message +=  LOGGER.util.__fileName() + 
            ':' + LOGGER.util.__line() +
            ':' + LOGGER.util.__column() +
            '';

        message += COLOR_RESET; 
    }

    if(LOGGER.options.showFullStackTrace){ 
        // Show full stack trace if set
        // --------------------------
        message += '\n' + COLOR_RESET + STYLES.backgrounds.white + 
            STYLES.colors.black +
            '(Stack Trace)' +
            COLOR_RESET + 
            '\n';
        
        // Skip the first item in the stack (this function)
        for(i=1; i<LOGGER.util.__stack().length; i++){
            message += COLOR_RESET + '\t'; 
            // If it's the previous called function, highlight it
            message += LOGGER.util.__stack()[i];

            message += '\n';
        }
    }

    message += '\n';

    // Setup final log message format, depending on if it's a browser or not
    // ------------------------------
    finalLog.push(
        COLOR_RESET + "[ " + 
        (getColor(type) + type + COLOR_RESET) + 
        " ] \t" + message + 
        COLOR_RESET
    );

    finalLog = finalLog.concat(extraArgs);

    // Finally, check if it should be added to the history
    // ------------------------------
    if(LOGGER.options.storeHistory || LOGGER.options.storeAllHistory){
        // show the history be stored? if so, store it
        LOGGER.history[type] = LOGGER.history[type] || []; //ensure existence
        LOGGER.history[type].push(finalLog);
    }

    // Log it
    // ------------------------------
    if( LOGGER.canLog(type) ){ 
        // Only output if it was specified in the log level
        // TODO: emit events that transports can listen on (console, file, 
        // remote, etc)
        console.log.apply( console, finalLog );
    }
};

module.exports = LOGGER;
