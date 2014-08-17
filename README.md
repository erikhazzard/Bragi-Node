# Bragi : Javascript Logger

Bragi is javascript logging library with colors, custom log levels, and server reporting functionality.

![Bragi](http://38.media.tumblr.com/tumblr_lcdao4PDgj1qbz35lo1_500.jpg)


This repository is for the NodeJS version of Bragi. Bragi allows you to write log messages that you can leave in your code, and allows you to specify what logs get output to the console.

### Usefulness of logging

[View an overview of how logging can be a powerful tool](http://vasir.net/blog/development/how-logging-made-me-a-better-developer).

Logging is a powerful and often underused tool. Like anything, there are tradeoffs. Some of the benefits of persisting log statements in your code include:

* Doubles as explicit documentation. In some ways, they're like actionable comments
* Makes it significantly easier to debug the flow of execution
* Aides in refactoring
* Helps you to maintain context of what your code is doing


# Usage

## Specifying what to log

`groupsEnabled`: An {Array} of {String}s or {RegExp} regular expressions, specifying which groups can be logged. NOTE: Can also be a {Boolean} : if `true`, *everything* is logged; if `false`, nothing is logged

`groupsDisabled`: An {Array} of {String}s {RegExp} regular expressions, specifying which groups to exclude from logging. This is useful if you want to log everything *except* some particular groups.

**Examples**:

`var logger = require('bragi');`
`logger.options.groupsEnabled = [ 'group1:subgroup1', '.*:userId' ]` would log all group1:subgroup1 logs (including nested subgroups, e.g., `group1:subgroup1:subsubgroup1`). `.*:userId` would match anything that contained ":userId" (`userId` could be an actual userId, would allow you to capture all logs for a particular user)

To specify a blacklist via groupsDisabled:
`logger.options.groupsEnabled = true; logger.options.groupsDisabled = ['group1'];`  This would log everything *except* `group1`


## Output
By default the logger will log to console. 

TODO: ** Log structured data ** e.g., { message: "Message", meta: { time: '...', ... }, OTHER_KEYS_USER_PASSES_IN }

TODO: Output modes

TODO: File logging, sending requests... other transports

## Log Levels
Unlike other libraries where log levels are linear, in Bragi log levels are categorical and completely arbitrary. You can have nested log levels, e.g.: `logger.log("group1:subgroup1", "Log message %O", {key: 42});". 

By having arbitrary log levels, you can have fine grain control over what log messages are outputted. 

## Formatting Options

When logging, it is useful to be able to log objects. The simplest way to do this is to use string formatting and log a passed in object as JSON. For instance: ("Hello there %j", { key: 42 })

* `%j`	Formats value as a JSON object


## Running Tests
Run `npm test`
