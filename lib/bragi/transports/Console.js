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
    'asterisk', 'floral', 'snowflake', 'fourDiamond', 'spade', 'club', 'heart', 
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
    // showMeta: {Boolean} Show the meta info (calling func, time, line num, etc)
    //  NOTE: This is primarily used only if you want to disable everything.
    //  If this is true and showStackTrace 
    //  options will be checked. If it is set to false, nothing will be shown
    this.showMeta = options.showMeta !== undefined ? options.showMeta : true;
    
    // showStackTrace: {Boolean} provide the full stack trace? Disabled
    // by default
    this.showStackTrace = options.showStackTrace !== undefined ? options.showStackTrace : false;

    // Add a line break after the last thing sent?
    this.addLineBreak = options.addLineBreak !== undefined ? options.addLineBreak : false;

    // Transport specific settings
    // ----------------------------------
    this.showColors = options.showColors === undefined ? true : options.showColors;

    this._foundColors = [];
    this._colorDict = {
        error: STYLES.styles.bold + SYMBOLS.error + ' ' +
            STYLES.backgrounds.red + STYLES.colors.white,
        warn: STYLES.styles.bold + SYMBOLS.warn + ' ' +
            STYLES.backgrounds.yellow + STYLES.colors.white
    };

    this.curSymbolIndex = 0;

    // Batching
    // ----------------------------------
    // Batching? In console?!?! wut? This can be useful if you're piping
    // console output to a file and want to mitigate disk I/O
    if(options.batchEnabled){
        this.batchEnabled = true;
    }
    this.bufferSize = options.bufferSize || 100;
    this.writeTimeout = options.writeTimeout || 100;
    this._buffer = [];

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

TransportConsole.prototype.batchLog = function batchLog(){
    // calls console log in a batch manner
    // add an empty string to add an empty newline
    this._buffer.push('');

    // log at once
    console.log(
        this._buffer.join('\n')
    );

    //immediately clear buffer
    this._buffer = [];
    if(this._writeTimeout){
        clearTimeout(this._writeTimeout);
        // no more timeout
        this._batchHasTimeout = false;
    }
};

// Prototype properties (All these must exist to be a valid transport)
// --------------------------------------
TransportConsole.prototype.name = 'Console';

TransportConsole.prototype.log = function transportConsoleLog( loggedObject ){
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
    var self = this;
    var consoleMessage = "";

    // Setup final log message format, depending on if it's a browser or not
    // ------------------------------
    // NOTE: Use the full styledMessage property
    if (this.showColors) {
        consoleMessage += 
            STYLES.colors.reset + "[ " + 
                (this.getColor(loggedObject.group) + ' ' + 
                    loggedObject.group + 
                ' ' + STYLES.colors.reset) + 
            " ] \t";
        consoleMessage += loggedObject.styledMessage + STYLES.colors.reset;

    } else {
        consoleMessage +=  "[ " + loggedObject.group + " ] \t";
        consoleMessage += loggedObject.message; 
    }

    // Include some meta info (time, function that called, etc.)
    // ----------------------------------
    if(this.showMeta){
        consoleMessage += '\n  ' + STYLES.colors.grey;

        // JSON timestamp
        consoleMessage += loggedObject.meta.date + '\t ';

        // Show the name of the calling function
        if(loggedObject.meta.caller){
            consoleMessage += 'caller: ' + loggedObject.meta.caller + ' \t    ';
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

    if(this.showStackTrace && loggedObject.meta.trace){ 
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

    // add line break to console messages if set
    if(this.addLineBreak){ 
        consoleMessage += '\n';
    }

    // Log it
    // ------------------------------
    if(!this.batchEnabled){
        console.log( consoleMessage );

    } else {
        // Batch enabled, so batch it
        this._buffer.push( consoleMessage );

        // force writes after some number of logs
        if(this._buffer.length > this.bufferSize){
            this.batchLog();
        }
        // set a small timeout to force a write
        if(!this._batchHasTimeout){
            // only add the timeout if one isn't already set
            this._batchHasTimeout = true;

            this._writeTimeout = setTimeout(
                function(){ self.batchLog.call(self); }, 
                this.writeTimeout
            );
        }
    }

    return this;
};

module.exports = TransportConsole;
