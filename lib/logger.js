'use strict';

var _ = require('lodash');
var bunyan = require('bunyan-lite');

//Get the config
var config = require('./config');

//Create our variables
var env = config.get('NODE_ENV');
var output;

if (config.get('bunyan') || config.get(env + ':use_bunyan')) {
  var settings = _.cloneDeep(config.get(env + ':bunyan'));

  // Stream can be specified either in settings.streams[ix] or globally in settings.stream, but not
  // both. Since the defaults specify stetings.stream, if the user specifies anything of vaulue
  // in settings.streams, we should delete the global defaults, because bunyan gets angry if there
  // are multiple keys
  if (_.has(settings, 'streams')) {
    if (settings.streams) {
      delete settings.stream;
      delete settings.level;
    } else {
      delete settings.streams;
    }
  }

  _([settings.streams, settings])
    .flatten()
    .compact()
    .forEach(function (settingObj) {
      if (settingObj.stream === 'process.stdout') {
        settingObj.stream = process.stdout;
      } else if (settingObj.stream === 'process.stderr') {
        settingObj.stream = process.stderr;
      }
    });

  output = bunyan.createLogger(settings);
} else {
  output = console;
  output.debug = console.log.bind(console);
}

module.exports = output;
