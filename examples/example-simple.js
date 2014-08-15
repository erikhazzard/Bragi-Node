/* =========================================================================
 *
 * example-simple.js
 *      Simple call
 *  
 * ========================================================================= */
var logger = require('../lib/bragi');

//// This is set by default:
//logger.options.logLevel = true;

logger.log('group1', 'Hello %j', "world");
logger.log('group1', 'Hello %j', [1,2,3]);
logger.log(
    'group1', 
    'Hello ', 
    {name: 'world', size: 'big', props: {answer: 42}},
    {name: 'world', size: 'big', props: {answer: 42}}
);
