/* =========================================================================
 *
 * example-calls.js
 *      Sample options config and logs
 *  
 * ========================================================================= */
var logger = require('../lib/bragi');

// Configure logger
// --------------------------------------

//// Show the full stack trace for each log?
//logger.options.showFullStackTrace = true;

//// Show the meta info for each log (caller func, time, filename, line, column)
//// (true by default)
//logger.options.showMeta = false;

// --------------------------------------
//
// Log Examples
//
// --------------------------------------

// Functions
// --------------------------------------
// Named function example
function logIt(){
    // Note: these logs will show calling function name as it's a named function
    logger.log('group1', 'Hi');
    logger.log('group1', 'Hi : %j : %j', { key: 42}, { k: 1 });
}
logIt();

// Anonymous function example (try to avoid these)
(function(){
    logger.log('group1', 'No function name');
})();


// --------------------------------------
// Direct calls
// --------------------------------------
logger.log('group1', 'Hi');
logger.log('group1:subgroup1', 'Hi');
logger.log('group1:subgroup1:subgroup2', 'Hi');

// Set log level (specifying which logs to show
logger.options.logLevel = ['group1'];
logger.log('group1', 'Shown');
logger.log('group2', 'Not shown');

// Set log level - sub groups
logger.options.logLevel = ['group1:subgroup1'];
logger.log('group1:subgroup1', 'Shown');
logger.log('group1:subgroup2', 'Shown');


// --------------------------------------
// Show multiple logs
// --------------------------------------
// Everything
logger.options.logLevel = true;
logger.log('group1', 'I am the first');
logger.log('group2', 'I am the second');
logger.log('group3', 'I am just right');
logger.log('group4', 'What am I doing here');


// --------------------------------------
// Some built in UTF8 symbols
// --------------------------------------
logger.log('group1', logger.util.symbols.success + ' great success');
logger.log('group1', logger.util.symbols.error + ' I have failed you');

logger.log('group2', logger.util.symbols.box + ' Starting an async request');
logger.log('group2', '\t' + logger.util.symbols.boxSuccess + ' it worked');
logger.log('group2', '\t' + logger.util.symbols.boxError + ' it failed');

// --------------------------------------
// Printing colors
// --------------------------------------
// We can also use colors
logger.log(
    'group3', 
    logger.util.print('I am red', 'red') + " but I am not red"
);

// or pass in symbols too - first param is just a string
logger.log(
    'group3', 
    logger.util.print(logger.util.symbols.circle, 'yellow') + " yellow circle "
);
logger.log(
    'group3', 
    logger.util.print(logger.util.symbols.circleFilled, 'green') + " nom nom filled circle"
);
