'use strict';

var _ = require('lodash');
var bunyan = require('bunyan');

//Get the config
var config = require('./config');

//Create our variables
var env = config.get('NODE_ENV');
var output;

if (config.get('bunyan') || config.get(env + ':use_bunyan')) {
  var settings = _.cloneDeep(config.get(env + ':bunyan'));

  for (var i = 0; i < settings.streams.length; i++) {
    if (settings.streams[i].stream === 'process.stdout') {
      settings.streams[i].stream = process.stdout;
    }
  }

  output = bunyan.createLogger(settings);
} else {
  output = console;
  output.debug = console.log.bind(console);
}

module.exports = output;
