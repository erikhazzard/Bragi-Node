/* =========================================================================
 *
 * example-simple.js
 *      Simple call
 *  
 * ========================================================================= */
var logger = require('../lib/bragi');

logger.log('group1:subgroup1', 'Hello %j', "world");
logger.log('group1:subgroup1', 'Hello %j', [1,2,3]);

// Store stack trace so line numbers can be shown
logger.options.storeStackTrace = true;
logger.transports.get('Console').property('showMeta', false);
logger.log(
    'group1', 
    logger.util.print('Hello', 'green') + ' Not showing meta. Props: %j ::::::', 
    {name: 'world', size: 'big', props: {answer: 42}},
    {name: 'world', second: true, size: 'big', props: {answer: 42}}
);

// turn back on meta info
logger.transports.get('Console').property('showMeta', true);

// Now show the full stack trace ( set on the Console transport )
logger.transports.get('Console').property('showStackTrace', true);

logger.log('group1', 'Hello %j', 'world');
logger.log('group1'); // empty log call

// Turn off stack trace
logger.transports.get('Console').property('showStackTrace', false);

logger.log('group1', logger.util.print('I am green', 'green') + ' and ' + 
    logger.util.print('I am blue', 'blue'));


// Set multiple properties with an object
logger.transports.get('Console').property({
    showStackTrace: true,
    showMeta: false
});
logger.log('group1:options', 'And I am logged with options set by an object');


// reset properties and test batchEnabled
logger.transports.get('Console').property({ 
    showStackTrace: false, showMeta: true,
    // test batching (will wait 100ms between outputting to console)
    batchEnabled: true
});

// use addGroup
logger.options.logLevel = [];
logger.addGroup('test');
logger.log('test', '0 will log');
logger.log('test', 'will log');
logger.log('test', 'will log');
logger.log('test', 'will log');
logger.log('test', 'will log');
logger.log('test', 'will log');
logger.log('test', 'will log');
logger.log('test', 'will log');

setTimeout(function(){
    logger.log('test', '0 will log');
    logger.log('test', '1 will log');
    logger.log('test', '2 will log');
    logger.log('test', '3 will log');

    // Final
    logger.log('test:params', 'will show params', { world: true }, {second: true}, {third: true});

    // If hideUnformattedParams is true, do NOT log additional pass params
    logger.options.hideUnformattedParameters = true;
    logger.log('test:params', 'will NOT show params other than this one: %j', { world: true }, {second: true}, {third: true});

    // the option can be changed on the fly
    logger.options.hideUnformattedParameters = false;
    logger.log('test:params', 'will show params', { world: true }, {second: true}, {third: true});

}, 90);

logger.log('test', 'test for %j | should be 42: <%j> ', undefined, 42);
