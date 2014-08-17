/* =========================================================================
 *
 * example-json.js
 *      Simple call using JSON transport
 *  
 * ========================================================================= */
var logger = require('../lib/bragi');

//// This properties are set by default:
//logger.options.logLevel = true;
//logger.options.showFullStackTrace = false;
logger.transports.empty();
logger.options.storeStackTrace = true;
logger.transports.add( new logger.transportClasses.ConsoleJSON() );

logger.log('group1', 'Hello %j', "world");
logger.log('group1', 'Hello %j', [1,2,3]);
logger.log(
    'group1', 
    logger.util.print('Hello %j :::::::: ', 'green'), 
    {name: 'world', size: 'big', props: {answer: 42}},
    {name: 'world', size: 'big', props: {answer: 42}}
);
