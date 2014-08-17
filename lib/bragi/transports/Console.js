/* =========================================================================
 *
 * Console
 *      Default transport - console
 *
 * ========================================================================= */
var STYLES = require('../styles');
var SYMBOLS = require('../symbols');

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
OVERFLOW_SYMBOLS = [
    'asertik', 'floral', 'snowflake', 'fourDiamond', 'spade', 'club', 'heart', 
    'diamond', 'queen', 'rook', 'pawn', 'atom' 
];

// ======================================
//
// Console Transport
//
// ======================================
function TransportConsole ( options ){
    options = options || {};
    // Transport must set groupsEnabled and groupsDisabled to provide transport 
    // level support for overriding what groups to log
    // (NOTE - the user does not need to pass in groupsEnabled, but the 
    // transport must set these properties)
    this.groupsEnabled = options.groupsEnabled;
    this.groupsDisabled = options.groupsDisabled;

    // Display / meta related config options
    // ----------------------------------
    // showCaller: {Boolean} will automatically include the calling 
    //      function's name. Useful for tracing execution of flow
    this.showCaller = options.showCaller !== undefined ? options.showCaller : true;

    // showTime: {Boolean} specifies wheter to include timestamp
    this.showTime = options.showTime !== undefined ? options.showTime : true;

    // showFullStackTrace: {Boolean} provide the full stack trace? Disabled
    // by default
    this.showFullStackTrace = options.showFullStackTrace !== undefined ? options.showFullStackTrace: false;

    // showMeta: {Boolean} Show the meta info (calling func, time, line num, etc)
    //  NOTE: This is primarily used only if you want to disable everything.
    //  If this is true, the showCaller, showTime, and showFullStackTrace 
    //  options will be checked. If it is set to false, nothing will be shown
    this.showMeta = options.showMeta !== undefined ? options.showMeta : true;

    // Transport specific settings
    // ----------------------------------
    this.showColors = options.showColors === undefined ? true : options.showColor;

    this._foundColors = [];
    this._colorDict = { 
        error: STYLES.styles.bold + SYMBOLS.error + ' ' + 
            STYLES.styles.blink + STYLES.backgrounds.red + STYLES.colors.white,
        warn: STYLES.styles.bold + STYLES.styles.blink + STYLES.backgrounds.yellow +
            STYLES.colors.white 
    };

    this.curSymbolIndex = 0;

    return this;
}

TransportConsole.prototype.getColor = function getColor(group){
    // Color Formatting
    // ----------------------------------
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
    if(this._colorDict[group]){ 
        return this._colorDict[group];
    }

    if(this._foundColors.length >= GROUP_COLORS.length){
        // is the index too high? loop around if so
        color = GROUP_COLORS[this._foundColors.length % GROUP_COLORS.length];
        baseColor = color;

        // setup symbol
        // ------------------------------
        if(!OVERFLOW_SYMBOLS[this.curSymbolIndex]){
            // reset index to 0
            this.curSymbolIndex = 0;
        }
        curSymbol = SYMBOLS[OVERFLOW_SYMBOLS[this.curSymbolIndex]];
        this.curSymbolIndex++;

        // add underline if odd
        // ------------------------------
        if(this._foundColors.length % GROUP_COLORS.length === 1){
            color += STYLES.styles.underline;
        }

        // set final color
        // ------------------------------
        color += baseColor + curSymbol;

    } else {

        // We haven't yet exhausted all the colors
        color = GROUP_COLORS[this._foundColors.length];
    }

    // update the stored color info
    this._foundColors.push(color);
    this._colorDict[group] = color;

    return color;
};


// Prototype properties (All these must exist to be a valid transport)
// --------------------------------------
TransportConsole.prototype.name = 'Console';

TransportConsole.prototype.log = function transportConsoleLog( loggedObject, loggerOptions ){
    // log
    //  Logs a passed object to the console
    //
    //  params:
    //      loggedObject: {Object} the log object to log
    //      options : {Object} the logger options
    //
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
        STYLES.colors.reset + "[ " + 
            (this.getColor(loggedObject.group) + ' ' + 
                loggedObject.group + 
            ' ' + STYLES.colors.reset) + 
        " ] \t";

    // NOTE: Use the full styledMessage property
    consoleMessage += loggedObject.styledMessage + STYLES.colors.reset;

    // Include some meta info (time, function that called, etc.)
    // ----------------------------------
    if(this.showMeta){
        consoleMessage += '\n' + STYLES.colors.grey;

        // Show the name of the calling function
        if(this.showCaller){
            consoleMessage += 'caller: ' + loggedObject.meta.caller + ' \t    ';
        } 
        if(this.showTime){
            // JSON timestamp
            consoleMessage += new Date().toJSON() + ' \t ';
        }

        // For node, log line number and filename
        if(loggedObject.meta.file && loggedObject.meta.line ){
            consoleMessage +=  loggedObject.meta.file +
                ':' + loggedObject.meta.line +
                ':' + loggedObject.meta.column +
                '';
        }

        consoleMessage += STYLES.colors.reset; 
    }

    if(this.showFullStackTrace && loggedObject.meta.trace){ 
        // Show full stack trace if set
        // --------------------------
        consoleMessage += '\n' + STYLES.colors.reset + STYLES.backgrounds.white + 
            STYLES.colors.black +
            '(Stack Trace)' +
            STYLES.colors.reset + 
            '\n';
        
        // Skip the first item in the stack (this function)
        for(i=0; i<loggedObject.meta.trace.length; i++){
            consoleMessage += STYLES.colors.reset + '\t' + 
                loggedObject.meta.trace[i] + '\n';
        }
    }

    consoleMessage += '\n';

    // Log it
    // ------------------------------
    console.log( consoleMessage );

    return this;
};

module.exports = TransportConsole;
