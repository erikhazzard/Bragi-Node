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
    //origLog.apply(console.log, arguments);
};

// --------------------------------------
//
// Logging Tests
//
// --------------------------------------
describe('Bragi: Javascript Logger', function(){
    // Reset the logs array before each test
    beforeEach(function(){
        logs = [];
    });
    
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

    //Log config tests
    // ----------------------------------
    describe('Config tests', function(){
        it('test', function(){
            assert(true);
        });
    });

    after(function(){
        console.log = origLog;
    });
});
