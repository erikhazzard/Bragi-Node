# Bragi : Javascript Logger

*NOTE : This is an early release and the API is subject to change. Improvements and pull requests are welcome*

Bragi is javascript logging library with colors, custom log levels, and server reporting functionality. This repository is for the NodeJS version of Bragi. Bragi allows you to write log messages that you can leave in your code, and allows you to specify what logs get output to the console.

![Bragi](http://38.media.tumblr.com/tumblr_lcdao4PDgj1qbz35lo1_500.jpg)

## Ideas Behind Bragi

Some of the core concepts driving Bragi are:

* By design, there should be many calls to log() inside the application’s codebase and these calls should never need to be removed. 

* Log output should not be coupled to calls to log(). It should be easy to send the output of log() calls to the console, to a file, or to a remote host. It should even be simple to have the library send your phone a push notifications for certain types of logs.

* Logs messages should be structured data - for Bragi, all calls to log() should produce a JSON object with the logged message and some meta info. This makes working with logs easier and allows better integration with third party services like Graylog or Kibana

* The logging library should itself not care what you do with the logs, but enable you to effortlessly do whatever you wish with them.


### Usefulness of logging

[View an overview of how logging can be a powerful tool](http://vasir.net/blog/development/how-logging-made-me-a-better-developer).

Logging is a powerful and often underused tool. Like anything, there are tradeoffs. Some of the benefits of persisting log statements in your code include:

* Doubles as explicit documentation. In some ways, they're like actionable comments
* Makes it significantly easier to debug the flow of execution
* Aides in refactoring
* Helps you to maintain context of what your code is doing


# Usage

## Log Levels
Unlike other libraries where log levels are linear, in Bragi log levels are categorical and completely arbitrary. You can have nested log levels, e.g.: `logger.log("group1:subgroup1", "Log message %O", {key: 42});". 

By having arbitrary log levels, you can have fine grain control over what log messages are outputted. 

## Specifying what to log

`groupsEnabled`: An {Array} of {String}s or {RegExp} regular expressions, specifying which groups can be logged. NOTE: Can also be a {Boolean} : if `true`, *everything* is logged; if `false`, nothing is logged

`groupsDisabled`: An {Array} of {String}s {RegExp} regular expressions, specifying which groups to exclude from logging. This is useful if you want to log everything *except* some particular groups.

**Examples**:

`var logger = require('bragi');`
`logger.options.groupsEnabled = [ 'group1:subgroup1', '.*:userId' ]` would log all group1:subgroup1 logs (including nested subgroups, e.g., `group1:subgroup1:subsubgroup1`). `.*:userId` would match anything that contained ":userId" (`userId` could be an actual userId, would allow you to capture all logs for a particular user)

To specify a blacklist via groupsDisabled:
`logger.options.groupsEnabled = true; logger.options.groupsDisabled = ['group1'];`  This would log everything *except* `group1`

### Examples
In the `examples` folder, there are various examples of calling and configuring Bragi.

# Output - Transports
By default, Bragi uses the Console transport, which will log colored messages to the console.

## Writing Custom Transports
All transports must be functions that containg a prototype a prototype `name` property and `log` function. The transport function itself must take in an options object and allow `groupsEnabled` and `groupsDisabled` to be passed into it. This allows transport level white listing / black listing of log groups (for instance, maybe the console should only capture `group1`, but the file transport should capture *all* log messages)

The `log` function expects a `loggedObject` to be passed into it, which is an object created after log() is called. It will have a `meta` property, along with a `message` (the log message itself), a `group` (what group the log message belongs to), and a `properties` key containing any additional arguments passed into logger.log() calls.

NOTE: See `examples/example-json.js` to see what a loggedObject looks like.

Here is what a simple transport definition looks like:

    function MyTransport ( options ){
        options = options || {};

        // Transport must set groupsEnabled and groupsDisabled to provide transport 
        // level support for overriding what groups to log
        // (NOTE - the user does not need to pass in groupsEnabled, but the 
        // transport must set these properties)
        this.groupsEnabled = options.groupsEnabled;
        this.groupsDisabled = options.groupsDisabled;

        // Transport specific settings
        // ------------------------------
        this.spacing = options.spacing === undefined ? 4 : options.spacing;

        return this;
    }

    MyTransport.prototype.name = 'MyTransport';
    MyTransport.prototype.log = function MyTransportLog( loggedObject ){
        // Do something with loggedObject 
        return this;
    };


See `lib/bragi/transports/ConsoleJSON` for a simple example of a working transport.

## Running Tests
Run `npm test`
