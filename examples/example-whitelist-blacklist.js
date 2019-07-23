/* =========================================================================
 *
 * example-simple.js
 *      Simple call
 *
 * ========================================================================= */
var logger = require('../lib/bragi');

logger.options.keyWhitelist = {
    name: true,
    id: true,
    headers: true,
};

// Only id and name will be logged
logger.log('group1:subgroup1', 'Hello %j', {
    name: 'Tester',
    id: '1234567',
    creditCard: '1234',
    password: '*****',
    email: 'tester@test.com',
    notLogged: {
        id: 'nonono',
        name: 'neverlogged',
    },
    headers: {
        name: 'test',
        password: '********',
        headers: {
            'id': 'inner',
        },
        nestedObjectCanBeLogged: {
            name: "test",
            headers: {
                'id': 'inner',
            },
        },
        innerNestedObject: {
            password: "*****"
        }
    }
});


// Check Blacklist
logger.options.keyWhitelist = true;
logger.options.keyBlacklist = {
    name: true,
    password: true,
};

// Only id and name will be logged
logger.log('group2:subgroup1', 'Hello %j', {
    name: 'Tester',
    id: '1234567',
    creditCard: '1234',
    password: '*****',
    someArray: [ 'test', ],
    someArray2: [ { test: 42, }, ],
    invalidObj: { 'test': null, 'testundef': undefined, 'test0': 0, },
    email: 'tester@test.com',
    notLogged: {
        id: 'nonono',
        name: 'neverlogged',
    },
    headers: {
        name: 'test',
        password: '********',
        headers: {
            'id': 'inner',
        },
        nestedObjectCanBeLogged: {
            name: "test",
            headers: {
                'id': 'inner',
            },
        },
        innerNestedObject: {
            password: "*****"
        }
    }
});
