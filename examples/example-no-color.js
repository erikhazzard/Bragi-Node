/* =========================================================================
 *
 * example-calls.js
 *      Sample options config and logs
 *  
 * ========================================================================= */
var logger = require('../lib/bragi');

// Configure logger
// --------------------------------------
logger.log('group0:subgroup1', 'Hello world');

logger.transports.get('Console').property('showColors', false); 
logger.log('group1:subgroup1', 'Hello world');
logger.log('group1:subgroup1', 'Hello world %j', {test: 42});



logger.transports.add(new logger.transportClasses.ConsoleJSON({}));
logger.log('group2:subgroup1', 'Hello world');
