/* =========================================================================
 * 
 * Tests
 *      Runs a variety of tests for the logging system
 *
 * ========================================================================= */
var mocha = require('mocha');
var should = require('chai').should();
var _ = require('lodash');
var request = require('request');
var chai = require('chai');
var assert = chai.assert;

// Our library
var logger = require('../lib/bragi');

// we need to capture log output
var logs = [];
var origLog = console.log;

console.log = function logOverride(msg) {
    logs.push([].slice.call(arguments));
    //// to hide all logs:
    //origLog.apply(console.log, arguments);
};
// --------------------------------------
//
// Logging Tests
//
// --------------------------------------
describe('Bragi: Javascript Logger', function(){

    // ----------------------------------
    //
    // Reset logs, logLevel, and history before *each* test
    //
    // ----------------------------------
    beforeEach(function(){
        logs = [];
        logger.options.logLevel = true;
        logger.history = {};
    });
    
    // ----------------------------------
    // Basic logging tests
    // ----------------------------------
    describe('log() by group', function(){

        describe('log everything', function(){
            it('should log everything', function(){
                logger.options.logLevel = true;
                logger.log('group1', 'hello'); 
                logs.length.should.equal(1);
            });

            it('should log everything', function(){
                logger.options.logLevel = true;
                logger.log('group1', 'hello'); 
                logger.log('group2', 'hello'); 
                logger.log('group3', 'hello'); 
                logs.length.should.equal(3);
            });
        });

        describe('log by groups', function(){
            it('should only log one group', function(){
                logger.options.logLevel = ['group1'];
                logger.log('group1', 'logged'); 

                logger.log('some-group-group1', 'not logged'); 
                logger.log('group2', 'not logged'); 
                logs.length.should.equal(1);
            });

            it('should log multiple groups', function(){
                logger.options.logLevel = ['group1', 'group2'];
                logger.log('group1', 'logged'); 
                logger.log('group2', 'logged'); 

                logger.log('group3', 'not logged'); 
                logs.length.should.equal(2);
            });

            it('should log subgroups', function(){
                logger.options.logLevel = ['group1:subgroup1'];
                logger.log('group1:subgroup1', 'logged'); 

                logger.log('group1:subgroup2', 'not logged'); 
                logs.length.should.equal(1);
            });

            it('should log subgroups and their subgroups', function(){
                logger.options.logLevel = ['group1:subgroup1'];
                logger.log('group1:subgroup1', 'logged'); 
                logger.log('group1:subgroup1:subgroup2', 'logged'); 

                logger.log('group1:subgroup2', 'not logged'); 
                logger.log('blabla:group1:subgroup1', 'not logged'); 
                logs.length.should.equal(2);
            });
        });
    });

    // ----------------------------------
    // Util
    // ----------------------------------
    describe('Util tests', function(){

        describe('print() function', function(){
            it('should return string with right colors', function(){
                var string = logger.util.print('Test', 'red');
                assert(string.indexOf(logger.util.colors.red) === 0);
                assert(string.indexOf(logger.util.colors.reset) !== -1);
            });
        });

        describe('Symbols', function(){
            it('should return some symbols', function(){
                assert(logger.util.symbols.success.indexOf('✔︎') !== -1);
            });
        });
    });

    // ----------------------------------
    // History Tests
    // ----------------------------------
    describe('History tests', function(){
        it('should log some group and story history', function(){
            logger.options.logLevel = true;

            logger.log('h1', 'hello');
            assert(logger.history.h1.length === 1);
        });

        it('should log some group and story history for multiple groups', function(){
            logger.options.logLevel = true;

            logger.log('h2', 'hello');
            assert(logger.history.h2.length === 1);

            logger.log('h2', 'hello again');
            assert(logger.history.h2.length === 2);

            logger.log('h3', 'hello again');
            assert(logger.history.h3.length === 1);
            assert(logger.history.h2.length === 2);

            logger.log('h4', 'hello there');
            logger.log('h4', 'oh hi');
            assert(logger.history.h2.length === 2);
            assert(logger.history.h3.length === 1);
            assert(logger.history.h4.length === 2);
        });

        it('should not add logs to history if log level is not in logLevel array', function(){
            logger.options.logLevel = ['h1only'];
            
            logger.log('h1only', 'this is logged in history');
            // won't get added to history since it's not logged
            logger.log('h2only', 'this is not logged');

            assert(logger.history.h1only.length === 1);
            assert(logger.history.h2only === undefined);
        });

        it('should add everything to history if storeAllHistory is true', function(){
            logger.options.storeAllHistory = true;
            logger.options.logLevel = ['h1only'];
            
            logger.log('h1only', 'this is logged in history');
            logger.log('h2only', 'this is also logged in history, but NOT logged to console');
            logger.log('h3only', 'this is also logged in history, but NOT logged to console');

            assert(logs.length === 1);
            assert(logger.history.h1only.length === 1);
            assert(logger.history.h2only.length === 1);
            assert(logger.history.h3only.length === 1);
            assert(logger.history.blabla === undefined);
        });

    });

    // ----------------------------------
    //
    // Reset the console log functionality when done
    //
    // ----------------------------------
    after(function(){
        console.log = origLog;
    });
});
