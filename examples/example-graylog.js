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
logger.transports.add(new logger.transportClasses.Graylog({
    //host: 'myhost.com' OR '1.2.3.4'
    port: 12202,
    additionalOptions: {
        // options to send for every requst
    }
}));

// NOTE: IP address needs to be resolved
logger.log('group1', 'not logged to graylog');

setTimeout(function(){

    //// Log it. These will be logged using the ConsoleJSON transport
    //logger.log('group1', 'Hello world');
    //logger.log('group1', 'Hello %j', [1,2,3]);
    //logger.log('group1', 'Hello', [1,2,3]);
    logger.log('group1', 'Hello : ' + Math.random() + ' | %j', { test: 42, inner: { a: 42 } });
    logger.log('error:group1', 'something went down %j', { test: 42, inner: { a: 42 } });

    setTimeout(function(){}, 400);
}, 500);
