# Bragi : Javascript Logger - NodeJS 
![NPM version](https://badge.fury.io/js/bragi.svg)

![Bragi](http://s3.amazonaws.com/vasir-assets/bragi/bragi-log-small.gif)

*NOTE : This is an early release and the API is subject to change. Improvements and pull requests are welcome. [View the post which describes the purpose behind this library and some of its features](http://vasir.net/blog/development/how-logging-made-me-a-better-developer)*

Bragi is javascript logging library with colors, custom log levels, and server reporting functionality. Bragi allows you to write log messages that you can leave in your code, and allows you to specify what logs get output to the console.

This repository is for the NodeJS version of Bragi. The web browser version is coming soon

![Bragi](http://38.media.tumblr.com/tumblr_lcdao4PDgj1qbz35lo1_500.jpg)

*Bragi is the Norse god of Poetry*

# Installation and Usage
`$ npm install bragi`

Then, include it in your code: 

```javascript
var logger = require('bragi');
```

Next, log something:

```javascript
logger.log('groupname', 'Hello world');
```

All log groups are enabled by default. Calls to `log` take in two required parameters: `groupName` and `message`. Any additional parameters (such as object info) will be included in the log message also. For instance:
    
```javascript
logger.log('groupname', 'Here is some user info', { name: 'Ironman', weaknesses: null });
```

One of the benefits Bragi provides is the ability to supply arbitrary group names and namespace for groups (separated by a colon). For instance:

```javascript
logger.log('userController:fetchInfo', 'fetching user information...');
```

Because the groupname is a string, you can dynamically create it:
    
```javascript
logger.log('userController:fetchInfo:ironman', 'fetching user information...');
```

With group names, we're able to filter messages by groups and their namespaces, or by a regular expression (e.g., we have the ability to show ALL logs for the `ironman` user). By default, all groups are logged.

## Log Groups (log levels)
Unlike other libraries where log levels are linear, in Bragi log levels are discrete and arbitrary. You can have nested log levels, e.g.: `logger.log("group1:subgroup1", "Log message %O", {key: 42});`. 

By having arbitrary log levels, you can have fine grain control over what log messages are outputted. 

## Specifying what to log

`groupsEnabled`: An {Array} of {String}s or {RegExp} regular expressions, specifying which groups can be logged. NOTE: Can also be a {Boolean} : if `true`, *everything* is logged; if `false`, nothing is logged. Acts a whitelist.

`groupsDisabled`: An {Array} of {String}s {RegExp} regular expressions, specifying which groups to exclude from logging. This is useful if you want to log everything *except* some particular groups. Acts as a blacklist.


You can either access these arrays directly, or you can use `logger.addGroup( "groupName" );` (or `logger.addGroup( /groupRegex/ );` ) to add a group, and `logger.removeGroup( "groupName" );` (or `logger.addGroup( /groupRegex/ );` ) to remove a group from the groupsEnabled array.

Note that the first call to `addGroup` will change the behavior of logging *everything* to logging only the group provided.  

The `addGroup` and `removeGroup` functions return the logger object, and thus they can be chained: `logger.addGroup("group").addGroup("otherGroup");`

**Examples**:

```javascript
var logger = require('bragi');
```

Now, let's enable all `group1:subgroup1` logs and any log message that contains the user ironman, denoted by `:ironman`:

```javascript
logger.options.groupsEnabled = [ 'group1:subgroup1', '.*:ironman' ]
```

The this would log all `group1:subgroup1` logs, including nested subgroups: for instance, `group1:subgroup1:subsubgroup1`. 

`.*:ironman` would match anything that contained ":ironman" (You could even dynamically build this to look for logs based on some variable).

To specify a blacklist, use `groupsDisabled`. This would log everything *except* `group1`:

```javascript
logger.options.groupsEnabled = true; 
logger.options.groupsDisabled = ['group1'];
```

### Built in log types
Currently only two built in log types exist: `error` and `warn`. These types can also be namespaced (e.g., `error:group1:subgroup1` is valid). For error messages, the background will always be red and the foreground white. For warn messages, the background is yellow and foreground is white. The text will also blink. These are reserved colors, so anywhere a red background and white text exist you can immediately know an error has been logged.

Note that `errors` and `warn` logs will always be included unless explictly set in `groupsDisabled`.

### Examples
![Log example](http://s3.amazonaws.com/vasir-assets/bragi/bragi-log-still-small.png)
In the `examples` folder, there are various examples of calling and configuring Bragi.

## Util
Bragi provides a couple utility functions to help you write logs messages that have strong visual cues.

* `logger.util.symbols` : This is a dictionary of UTF-8 symbols - such as `success` (a green ✔︎) and  `error` (a red '✘'). All the symbols can be viewed in `lib/bragi/symbols.js`

* `logger.util.print( message, color )` : This is function takes in a message {String} and color {String} and returns the message string in the passed in color.

# Configuration

## Bragi config ##
To configure bragi, require it then set the properties defined in the `options` object. For instance:

```javascript
var logger = require('bragi');
logger.options.PROPERTY = VALUE;
```

The available options are:

* `groupsEnabled`: An array of {Strings} or {RegExp} (regular expressions) specifying which groups to log - which messages will be sent to all available transports
* `groupsDisabled`: An array of {Strings} or {RegExp} (regular expressions) specifying which groups to exclude from logs. This acts a blacklist, and will take priority over logs defined in `groupsEnabled`.
* `storeStackTrace`: `false` by default. Will store the stack trace if set to `true`. This provides more info, but adds overhead. Very useful when in development, tradeoffs should be considered when in production


# Output - Transports

By default, Bragi uses the Console transport, which will log colored messages to the console.

## Changing Transports

Currently, you can use `logger.transports.empty();` to remove all transports.

To add a transport, use `logger.transports.add( new logger.transportClasses.Transport( {} ) )` (where Transport is a transport, found in `lib/bragi/transports/`).

Currently available transports are `Console`, `ConsoleJSON`, `History`, and `File`. Future transports include sending data to a remote host (e.g., Graylog).

See `examples/example-json.js` for an example of removing the default transport and adding a new one.  

## Configuring Transports

All transports take in, at a minimum, `groupsEnabled` and `groupsDisabled`. This allows transport level configuration of what log messages to use. By default, they will use whatever is set on the global logger object. This is useful, for instance, if you want to send *all* logs to a remote host but only want to show error logs in the console output.

To configure a transport that is already added to the logger, you can use `logger.transports.get("TransportName");`. Note that this returns an {Array} of transports (this is because you may have multiple transports of the same type - e.g., it's possible to have multiple File transports).


NOTE: The console transport supports batching, which batches logs to console. This can be a minor performance optimization; specifically, if you have output piped to a file this will greatly reduce disk I/O. See `example-simple.js` for examples on usage. For instance, to enable: 

    logger.transports.get('Console').property({ 
        showStackTrace: false, showMeta: true,
        batchEnabled: true
    });


### Setting properties 
To set properties, you can:

1. access a transport object individually (e.g., `logger.transports.get('console')[0].PROPERTY= VALUE`) or 
2. set options for ALL returned transports by calling `.property( key, value )`. 

For instance, to show the stack trace in the console output: `logger.transports.get('console').property('showStackTrace', true);`

If only a key is passed in, it acts as getter (and returns an array of values). If key and value are passed in, it will set the property for *each* returned transports. NOTE: This is useful when you have a single transport, just be aware that if you use this on a file transport and change the output path, and you have multiple files transports, all file transports would log to that file.

See `examples/example-simple.json` (or `test/test.js`) for example usage.

## Formatting - Messages
If you call bragi without using a %j or %s or %s formatting string, any additional arguments pass the first will not be logged. However, they will be added to the internal data object and can be used by transports. This is useful if you have a lot of data you want to pipe to Graylog, for instance, but don't want to show up in the console log itself. For example:

```
    logger.log("group1", "Hello there", {note: "this won't be logged"});
```

To show the data in the log message, just pass in '%j':

```
    logger.log("group1", "Hello there %j", {note: "this WILL be logged"});
```


### Console Transport - Configuration

`showMeta`: {Boolean} `true` by default. Specifies whether to show the meta info (caller, time, etc.) as a new line after each message
`showStackTrace`: {Boolean} `false` by default. If set to true, requires the logger's `storeStackTrace` to be set to {true}. Will print the stack trace for each log

## Writing Custom Transports

All transports must be functions that containg a prototype a prototype `name` property and `log` function. The transport function itself must take in an options object and allow `groupsEnabled` and `groupsDisabled` to be passed into it. This allows transport level white listing / black listing of log groups (for instance, maybe the console should only capture `group1`, but the file transport should capture *all* log messages)

The `log` function expects a `loggedObject` to be passed into it, which is an object created after log() is called. It will have a `meta` property, along with a `message` (the log message itself), a `group` (what group the log message belongs to), and a `properties` key containing any additional arguments passed into logger.log() calls.

NOTE: See `examples/example-json.js` to see what a loggedObject looks like.

Here is what a simple transport definition looks like:

```javascript
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
```


See `lib/bragi/transports/ConsoleJSON` for a simple example of a working transport.

## Running Tests

While Bragi itself has no dependencies, the tests depend on Mocha and Chai. Install dev dependencies (`npm install -d`). Run `npm test`

# Ideas Behind Bragi

Some of the core concepts driving Bragi are:

* By design, there should be many calls to log() inside the application’s codebase and these calls should never need to be removed. 

* Log output should not be coupled to calls to log(). It should be easy to send the output of log() calls to the console, to a file, or to a remote host. It should even be simple to have the library send your phone a push notifications for certain types of logs.

* Logs messages should be structured data - for Bragi, all calls to log() should produce a JSON object with the logged message and some meta info. This makes working with logs easier and allows better integration with third party services like Graylog or Kibana

* The logging library should itself not care what you do with the logs, but enable you to effortlessly do whatever you wish with them.


## Usefulness of logging

[View an overview of how logging can be a powerful tool](http://vasir.net/blog/development/how-logging-made-me-a-better-developer).

Logging is a powerful and often underused tool. Like anything, there are tradeoffs. Some of the benefits of persisting log statements in your code include:

* Doubles as explicit documentation. In some ways, they're like actionable comments
* Makes it significantly easier to debug the flow of execution
* Aides in refactoring
* Helps you to maintain context of what your code is doing



Happy logging!
