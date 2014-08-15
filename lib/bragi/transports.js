/* =========================================================================
 *  transports
 *      Handles all transports
 *
 * ========================================================================= */
var fs = require('fs');
var path = require('path');

var transports = {};

// Load all transports
fs.readdirSync(path.join(__dirname, 'transports')).forEach(function (file) {
    var name = file.replace('.js','');
    if(name === 'Transports'){ return false; }

    // lazy getter
    transports.__defineGetter__(name, function () {
        return require('./transports/' + name);
    });
});

module.exports = transports;
