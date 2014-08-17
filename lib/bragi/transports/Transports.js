/* =========================================================================
 *
 * Transports
 *      Transports is an object which contains transports the logger uses
 *      to output logs
 *
 * ========================================================================= */
function Transports (){
    // This function is used by Bragi to keep track of what the currently
    // enabled transports to be used are
    
    this._transports = {};

    // Contains a count of # of transports by type
    this._transportCount = {};
    
    return this;
}

Transports.prototype.get = function get( transportName ){
    // Returns a transport object that matches the passed in name
    var returnedTransportObjects = [];

    for(var key in this._transports){
        // If the name is part of of the key, remove it
        if(key.toLowerCase().indexOf(transportName.toLowerCase()) > -1){
            returnedTransportObjects.push(this._transports[key]);
        }
    }

    return returnedTransportObjects;
};

Transports.prototype.add = function add( transport ){
    // Takes in a transport object and adds it to the transport object.
    //  If a transport object already exists (e.g., if there are two "File"
    //  transports already), the transport name will be transport.name + number

    if(this._transportCount[transport.name] === undefined){
        // Transport does not yet exist
        this._transportCount[transport.name] = 1;
        this._transports[transport.name] = transport;
    } else {
        // Transport already exists
        this._transportCount[transport.name] += 1;
        this._transports[transport.name + '' + (this._transportCount[transport.name] - 1)] = transport;
    }

    return this;
};

Transports.prototype.remove = function remove( transportName, index ){
    // Takes in the name of a transport (e.g., Console) and an optional index.
    // If no index is passed in, all transports that match the name will be 
    // removed. If an index is passed in, only the index will be removed. e.g.,
    // if there are two `File` transports, passed in index `1` will remove the
    // second file transport

    transportName = transportName;
    // if a transport object was passed in, remove the transport by name
    if(transportName.name){ transportName = transportName.name; }

    for(var key in this._transports){
        if(index !== undefined){
            if((transportName + '' + index) === key){
                delete this._transports[key];
            }
        } else {
            // If the name is part of of the key, remove it
            if(key.indexOf(transportName) > -1){
                delete this._transports[key];
            }
        }
    }

    return this;
};

Transports.prototype.empty = function empty (){
    // Removes all transports
    for(var key in this._transports){
        delete this._transports[key];
    }

    return this;
};

module.exports = Transports;
