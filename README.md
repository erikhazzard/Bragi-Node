# Bragi : Javascript Logger
Bragi is javascript logging library with colors, custom log levels, and server reporting functionality.

![Bragi](http://38.media.tumblr.com/tumblr_lcdao4PDgj1qbz35lo1_500.jpg)


This repository is for the NodeJS version of Bragi. Bragi allows you to write log messages that you can leave in your code, and allows you to specify what logs get output to the console.

# Usage

## Log Levels
Unlike other libraries where log levels are linear, in Bragi log levels are categorical and completely arbitrary. You can have nested log levels, e.g.: `logger.log("group1:subgroup1", "Log message %O", {key: 42});". 

By having arbitrary log levels, you can have fine grain control over what log messages are outputted. 

## Formatting Options
Format specifier    Description

* `%s`	Formats the value as a string.
* `%d` or `%i`	Formats the value as an integer.
* `%f`	Formats the object as a floating point value.
* `%O`	Formats the value as an expandable JavaScript object.

### Usefulness of logging

[View an overview of how logging can be a powerful tool](http://vasir.net/blog/development/how-logging-made-me-a-better-developer).

Logging is a powerful and often underused tool. Like anything, there are tradeoffs. Some of the benefits of persisting log statements in your code include:

* Doubles as explict documentation. In some ways, they're like actionable comments
* Makes it significantly easier to debug the flow of execution
* Aides in refactoring
* Helps you to maintain context of what your code is doing

