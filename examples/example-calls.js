/* =========================================================================
 *
 * example-calls.js
 *      Sample options config and logs
 *  
 * ========================================================================= */
var logger = require('../lib/bragi');

// Configure logger
// --------------------------------------

// Need to store the stack trace to see info on filename and line number
logger.options.storeStackTrace= true;

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
logger.log('group1', 'Top level group log');
logger.log('group1:subgroup1', 'subgroup message');
logger.log('group1:subgroup1:subgroup2', 'nested subgroup message');

// Set log level (specifying which logs to show
logger.options.groupsEnabled = ['group1'];
logger.log('group1', 'Shown');
logger.log('group2', 'Not shown');

// Set log level - sub groups
logger.options.groupsEnabled = ['group1:subgroup1'];
logger.log('group1:subgroup1', 'Shown');
logger.log('group1:subgroup2', 'Shown');


// --------------------------------------
// Show multiple logs
// --------------------------------------
// Everything
logger.options.groupsEnabled = true;

// --------------------------------------
// Some built in UTF8 symbols
// --------------------------------------
logger.log('mockRequest:sendData', logger.util.print(logger.util.symbols.arrow, 'yellow') + ' making request...');
logger.log('mockRequest:sendData:success', logger.util.symbols.success + ' returned success', { status: 200 });
logger.log('mockRequest:sendData:error', logger.util.symbols.error + ' returned an error!', { status: 500 });

logger.log('group2', logger.util.symbols.box + ' Starting an async request');
logger.log('group2', '\t' + logger.util.symbols.boxSuccess + ' it worked');
logger.log('group2', '\t' + logger.util.symbols.boxError + ' or maybe it failed');

// --------------------------------------
// Printing colors
// --------------------------------------
// We can also use colors
logger.log(
    'group3:showColor', 
    logger.util.print('I am red', 'red') + " but I am not red"
);

// or pass in symbols too - first param is just a string
logger.log(
    'group3:symbols', 
    logger.util.print(logger.util.symbols.circle, 'yellow') + " yellow circle "
);
logger.log(
    'group3:symbols', 
    logger.util.print(logger.util.symbols.circleFilled, 'green') + " nom nom filled circle"
);


// --------------------------------------
// log a bunch of stuff!
// --------------------------------------
var message;
for(var i=0; i<30; i++){
    message = "I am a log message! ";
    for(var j=0; j<(Math.random() * 5|0); j++){
        message += message;
    }
    logger.log('group' + i, message);
}


// --------------------------------------
// Finally, show some reserved messages
// --------------------------------------
logger.log('warn', 'This is a warning!', {message: 'It may not work'});
logger.log('error', 'This is an error!', {message: 'It did not work'});
