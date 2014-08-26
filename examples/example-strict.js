/* =========================================================================
 *
 * example-strict.js
 *      This example uses strict mode 
 *  
 * ========================================================================= */
"use strict";

var logger = require('../lib/bragi');

logger.log('group1', 'This will log');

function logIt(){
    logger.options.storeStackTrace = true;
    logger.transports.get('Console').property({
        showStackTrace: true
    });

    logger.log('group1', 'This also will log');

    logger.transports.get('Console').property({
        showStackTrace: false
    });
}
logIt();
