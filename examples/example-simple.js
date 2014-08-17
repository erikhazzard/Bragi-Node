/* =========================================================================
 *
 * example-simple.js
 *      Simple call
 *  
 * ========================================================================= */
var logger = require('../lib/bragi');


logger.log('group1', 'Hello %j', "world");
logger.log('group1', 'Hello %j', [1,2,3]);

// Store stack trace so line numbers can be shown
logger.options.storeStackTrace = true;
logger.log(
    'group1', 
    logger.util.print('Hello %j :::::::: ', 'green'), 
    {name: 'world', size: 'big', props: {answer: 42}},
    {name: 'world', size: 'big', props: {answer: 42}}
);

// Now show the full stack trace ( set on the Console transport )
logger.transports.get('Console')[0].showFullStackTrace = true;
logger.log('group1', 'Hello %j', "world");
