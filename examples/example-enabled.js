/* =========================================================================
 *
 * example-calls.js
 *      Sample options config and logs
 *  
 * ========================================================================= */
var logger = require('../lib/bragi');

// Log it all
logger.options.groupsEnabled = true;
logger.log('group1', 'I am logged');
logger.log('group2', 'I am logged');

// Log only group1
logger.options.groupsEnabled = ['group1'];
logger.log('group2', 'I am not logged');
