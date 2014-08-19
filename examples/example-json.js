/* =========================================================================
 *
 * example-json.js
 *      Simple call using JSON transport
 *  
 * ========================================================================= */
var logger = require('../lib/bragi');

//// This properties are set by default:
//logger.options.logLevel = true;

// Remove the default console transport and add a JSON console transport
logger.transports.empty();

// Store the stack trace for each log
logger.options.storeStackTrace = true;

// Now, add the ConsoleJSON trasport. Available transports can be found in
// ../lib/bragi/transports
logger.transports.add( new logger.transportClasses.ConsoleJSON() );

// Log it. These will be logged using the ConsoleJSON transport
logger.log('group1', 'Hello %j', "world");
logger.log('group1', 'Hello %j', [1,2,3]);
logger.log(
    'group1', 
    logger.util.print('Hello %j :::::::: ', 'green'), 
    {name: 'world', size: 'big', props: {answer: 42}},
    {name: 'world', size: 'big', props: {answer: 42}}
);
