# Bragi : Javascript Logger - NodeJS 

![Bragi](http://s3.amazonaws.com/vasir-assets/bragi/bragi-log-small.gif)

*NOTE : This is an early release and the API is subject to change. Improvements and pull requests are welcome. [View the post which describes the purpose behind this library and some of its features](http://vasir.net/blog/development/how-logging-made-me-a-better-developer)*

Bragi is javascript logging library with colors, custom log levels, and server reporting functionality. Bragi allows you to write log messages that you can leave in your code, and allows you to specify what logs get output to the console.

This repository is for the NodeJS version of Bragi. 

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

Calls to `log` take in two required parameters: `groupName` and `message`. Any additional parameters (such as object info) will be included in the log message also. For instance:
    
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

With group names, we're able to filter messages by groups and their namespaces, or by a regular expression (e.g., we have the ability to show ALL logs for the `ironman` user)

## Log Gropus (log levels)
Unlike other libraries where log levels are linear, in Bragi log levels are discrete and arbitrary. You can have nested log levels, e.g.: `logger.log("group1:subgroup1", "Log message %O", {key: 42});`. 

By having arbitrary log levels, you can have fine grain control over what log messages are outputted. 

## Specifying what to log

`groupsEnabled`: An {Array} of {String}s or {RegExp} regular expressions, specifying which groups can be logged. NOTE: Can also be a {Boolean} : if `true`, *everything* is logged; if `false`, nothing is logged

`groupsDisabled`: An {Array} of {String}s {RegExp} regular expressions, specifying which groups to exclude from logging. This is useful if you want to log everything *except* some particular groups.

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

Note that if you want to include these, you'll need to specify "error" and "warn" in the `groupsEnabled` array.

### Examples
![Log example](http://s3.amazonaws.com/vasir-assets/bragi/bragi-log-still-small.png)
In the `examples` folder, there are various examples of calling and configuring Bragi.

## Util
Bragi provides a couple utility functions to help you write logs messages that have strong visual cues.

* `logger.util.symbols` : This is a dictionary of UTF-8 symbols - such as `success` (a green ✔︎) and  `error` (a red '✘'). All the symbols can be viewed in `lib/bragi/symbols.js`

* `logger.util.print( message, color )` : This is function takes in a message {String} and color {String} and returns the message string in the passed in color.

# Output - Transports
By default, Bragi uses the Console transport, which will log colored messages to the console.

Currently, you can use `logger.transports.empty();` to remove all transports, and `logger.transports.add( new logger.transportClasses.Transport( {} ) )` (where Transport is a transport, found in `lib/bragi/transports/`).

See `examples/example-json.js` for an example of removing the default transport and adding a new one.  

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
Run `npm test`

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


