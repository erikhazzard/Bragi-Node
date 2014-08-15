/* =========================================================================
 *
 * canLog
 *
 *      Function which takes in a gropu and logLevel and returns a {Boolean}
 *      indicating if message can be logged
 *
 * ========================================================================= */
function canLog(group, logLevel){ 
    // Check if a passed in group {string} can be logged based on the passed in
    // logLevel ({Array} or {Boolean}). 
    // If the message cannot be logged, return false - otherwise, return true
    //

    if(logLevel === undefined){
        logLevel = true;
    }

    // by default, allow logging
    var canLogIt = true;

    if(logLevel === true){
        canLogIt = true;

    } else if(logLevel === false || logLevel === null){
        // Don't ever log if logging is disabled
        canLogIt = false;

    } else if(logLevel instanceof Array){
        // if an array of log levels is set, check it
        canLogIt = false;

        for(var i=0, len=logLevel.length; i<len; i++){
            // the current logLevel will be a string we check group against;
            // for instance,
            //      if group is "group1:group2", and if the current log level
            //      is "group1:group3", it will NOT match; but, "group1:group2" 
            //      would match.
            //          Likewise, "group1:group2:group3" WOULD match

            // If the current item is a regular expression, run the regex
            if(logLevel[i] instanceof RegExp){
                if(logLevel[i].test(group)){
                    canLogIt = true;
                    break;
                }
            } else if(group.indexOf(logLevel[i]) === 0){
                canLogIt = true;
                break;
            }
        }
    } 

    return canLogIt;
}

module.exports = canLog;
