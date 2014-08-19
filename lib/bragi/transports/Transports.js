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

// ======================================
//
// access
//
// ======================================
Transports.prototype.get = function get( transportName ){
    // Returns a transport object that matches the passed in name
    var returnedTransportObjects = new Array();

    for(var key in this._transports){
        // If the name is part of of the key, remove it
        if(key.toLowerCase().indexOf(transportName.toLowerCase()) > -1){
            returnedTransportObjects.push(this._transports[key]);
        }
    }

    returnedTransportObjects.property = function transportProperty( keyOrObject, value ){
        // Allow `.property()` to be called, which will return an array of 
        // values if just the `keyOrObject` is passed in. If `value` is also passed in 
        // as a string, it will set all returned transports's key to that value
        //
        // An object containing property keys and values can also be passed in
        // as the first and only argument to set multiple properties at once
        //
        // example calls: .property( 'showMeta', true );
        //                .property( {showMeta: true} );

        var i = 0;
        var len = this.length;

        if(typeof keyOrObject === 'string' && value === undefined){
            // Getter called. called like `.property('showMeta');`
            var vals = [];
            for(i=0; i<len; i++){ 
                vals.push(this[i][keyOrObject]);
            }
            return vals;

        } 
        else if( typeof keyOrObject === 'string' && value !== undefined ){
            // Setter called. called like `.property('showMeta', true);`
            for(i=0; i<len; i++){ 
                this[i][keyOrObject] = value;
            }
        }
        else if( typeof keyOrObject === 'object' ){
            // Object passed in like `.property( {showMeta: true} )`
            for(i=0; i<len; i++){ 
                for( var keyName in keyOrObject ){
                    this[i][keyName] = keyOrObject[keyName];
                }
            }
        }

        return this;
    };

    return returnedTransportObjects;
};

// ======================================
//
// Add / Remove
//
// ======================================
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
