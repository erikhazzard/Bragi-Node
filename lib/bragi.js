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

// --------------------------------------
// Setup logger object
// --------------------------------------
// Here, we use only a single LOGGER object which is shared among all files
// which import Bragi. 
// NOTE: Why use a single object? What are benefits? Could expose a "new"
//  logger object
//
// NOTE: It might be useful to have multiple loggers?
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
    circleFilled: '◉ ',
    asertik: '✢',
    floral: '❧',
    snowflake: '❄︎',
    fourDiamond:'❖',
    spade: '♠︎',
    club: '♣︎',
    heart: '♥︎',
    diamond: '♦︎',
    queen: '♛',
    rook: '♜',
    pawn: '♟',
    atom: '⚛'
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

    STYLES.backgrounds.white + STYLES.colors.black,
    STYLES.backgrounds.blue + STYLES.colors.white,
    STYLES.backgrounds.magenta + STYLES.colors.white,
    STYLES.backgrounds.green + STYLES.colors.white,

    STYLES.backgrounds.blue + STYLES.colors.black,
    STYLES.backgrounds.white + STYLES.colors.magenta,
    STYLES.backgrounds.magenta + STYLES.colors.black,
    STYLES.backgrounds.green + STYLES.colors.black,
    STYLES.backgrounds.cyan + STYLES.colors.white,
    STYLES.backgrounds.green + STYLES.colors.grey,
    STYLES.backgrounds.magenta + STYLES.colors.green,

    STYLES.backgrounds.yellow + STYLES.colors.red,

    STYLES.backgrounds.white + STYLES.colors.grey,
    STYLES.backgrounds.magenta + STYLES.colors.blue,

    STYLES.backgrounds.green + STYLES.colors.white
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

function canLog(group){ 
    // Check the logLevels and passed in group. If the message cannot be
    // logged, return false - otherwise, return true
    //
    // Note - this should not be accessed by the user
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
            // the current logLevel will be a string we check group against;
            // for instance,
            //      if group is "group1:group2", and if the current log level
            //      is "group1:group3", it will NOT match; but, "group1:group2" 
            //      would match.
            //          Likewise, "group1:group2:group3" WOULD match

            // If the current item is a regular expression, run the regex
            if(logLevel[i] instanceof RegExp){
                if(logLevel[i].test(group)){
                    canLogIt = true;
                    break;
                }
            } else if(group.indexOf(logLevel[i]) === 0){
                canLogIt = true;
                break;
            }
        }
    } 

    return canLogIt;
}

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
    error: STYLES.styles.bold + LOGGER.util.symbols.error + ' ' + 
        STYLES.styles.blink + STYLES.backgrounds.red + STYLES.colors.white,
    warn: STYLES.styles.bold + STYLES.styles.blink + STYLES.backgrounds.yellow +
        STYLES.colors.white 
};


var overflowSymbols = [
    'asertik', 'floral', 'snowflake', 'fourDiamond', 'spade', 'club', 'heart', 
    'diamond', 'queen', 'rook', 'pawn', 'atom' 
];
var curSymbolIndex = 0;

function getColor(group){
    // Returns the background color for a passed in log group
    // TODO: if more found colors exist than the original length of the
    // COLOR array, cycle back and modify the original color
    //
    var color = '';
    var baseColor = '';
    var curSymbol;

    // For color, get the first group
    group = group.split(':')[0];

    // if a color exists for the passed in log group, use it
    if(_colorDict[group]){ 
        return _colorDict[group];
    }

    if(_foundColors.length >= GROUP_COLORS.length){
        // is the index too high? loop around if so
        color = GROUP_COLORS[_foundColors.length % GROUP_COLORS.length];
        baseColor = color;

        // setup symbol
        // ------------------------------
        if(!overflowSymbols[curSymbolIndex]){
            // reset index to 0
            curSymbolIndex = 0;
        }
        curSymbol = LOGGER.util.symbols[
            overflowSymbols[curSymbolIndex]
        ];
        curSymbolIndex++;

        // add underline if odd
        // ------------------------------
        if(_foundColors.length % GROUP_COLORS.length === 1){
            color += STYLES.styles.underline;
        }

        // set final color
        // ------------------------------
        color += baseColor + curSymbol;

    } else {

        // We haven't yet exhausted all the colors
        color = GROUP_COLORS[_foundColors.length];
    }

    // update the stored color info
    _foundColors.push(color);
    _colorDict[group] = color;

    return color;
}

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
    if( !canLog(group) ){ 
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
    
    for(var i=0; i< extraArgs.length; i++){
        // For each argument, we need to check its type. If it's an object, then
        // we'll extend the loggedObject (if there are multiple keys, the last
        // key found takes priority). If it's an array or any other data type,
        // we'll set a new property called `argumentX` and set the value

        if(!(extraArgs[i] instanceof Array) && typeof extraArgs[i] === 'object'){
            for(var key in extraArgs[i]){
                loggedObject[key] = extraArgs[i][key];
            }
        } else {
            loggedObject['_argument' + i] = extraArgs[i];
        }
    }

    // setup meta
    // ----------------------------------
    var stackLen = LOGGER.util.__stack().length;
    var trace = [];
    for(i=1; i < stackLen; i++){
        trace.push(LOGGER.util.__stack()[i] + '');
    }

    loggedObject._meta = {
        caller: caller,
        date: new Date(),
        file: LOGGER.util.__fileName(),
        line: LOGGER.util.__line(),
        column: LOGGER.util.__column(),
        // add the full stack trace
        trace: trace
    };
    loggedObject._unixTimestamp = new Date().getTime() / 1000;

    // Setup group, message, other params
    // ----------------------------------
    loggedObject._group = group;

    // Setup the message
    // ----------------------------------
    // Format the message with the extra args (if set and if needed)
    var utilFormatArgs = [].slice.call(extraArgs);
    utilFormatArgs.unshift(message);
    loggedObject._message = util.format.apply(util, utilFormatArgs);


    // ============= CONSOLE OUTPUT ===========================================
    // Setup message for console output
    // ------------------------------
    //  The final message will look like: 
    //      [ group ]      message 
    //      meta info (function caller, time, file info)
    //
    var consoleMessage = "";

    // Setup final log message format, depending on if it's a browser or not
    // ------------------------------
    consoleMessage += 
        COLOR_RESET + "[ " + 
        (getColor(group) + ' ' + group + ' ' + COLOR_RESET) + 
        " ] \t";

    consoleMessage += loggedObject._message + COLOR_RESET;

    // Include some meta info (time, function that called, etc.)
    // ----------------------------------
    if(LOGGER.options.showMeta){
        consoleMessage += '\n' + STYLES.colors.grey;

        // Show the name of the calling function
        if(LOGGER.options.showCaller){
            consoleMessage += 'caller: ' + loggedObject._meta.caller + ' \t    ';
        } 
        if(LOGGER.options.showTime){
            // JSON timestamp
            consoleMessage += new Date().toJSON() + ' \t ';
        }

        // For node, log line number and filename
        consoleMessage +=  loggedObject._meta.file +
            ':' + loggedObject._meta.line +
            ':' + loggedObject._meta.column +
            '';

        consoleMessage += COLOR_RESET; 
    }

    if(LOGGER.options.showFullStackTrace){ 
        // Show full stack trace if set
        // --------------------------
        consoleMessage += '\n' + COLOR_RESET + STYLES.backgrounds.white + 
            STYLES.colors.black +
            '(Stack Trace)' +
            COLOR_RESET + 
            '\n';
        
        // Skip the first item in the stack (this function)
        for(i=1; i<LOGGER.util.__stack().length; i++){
            consoleMessage += COLOR_RESET + '\t' + LOGGER.util.__stack()[i] + '\n';
        }
    }

    consoleMessage += '\n';

    // Log it
    // ------------------------------
    if( canLog(group) ){ 
        // Only output if it was specified in the log level
        // TODO: emit events that transports can listen on (console, file, 
        // remote, etc)
        console.log( consoleMessage );
    }
    // ============= END CONSOLE OUTPUT =======================================
    


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
