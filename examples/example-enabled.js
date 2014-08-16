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
logger.options.groupsEnabled = ['group1', 'meta'];
logger.log('meta', 'About to log group2 (should not be logged)');
logger.log('group2', 'I am not logged');

// Use disabled property
logger.options.groupsEnabled = true;
logger.log('group1', 'I am logged');
logger.log('group2', 'I am logged');

logger.options.groupsDisabled = ['group1'];
logger.log('meta', 'about to log group1, should be disabled...');
logger.log('group1', 'should not be logged');

