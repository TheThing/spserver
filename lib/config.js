'use strict';

var nconf = require('nconf');

//Load arguments as highest priority
nconf.argv(require('./arguments'));

//Overrides
var overrides = {};

if (nconf.get('prod')) {
  overrides.NODE_ENV = 'production';
}
else if (nconf.get('debug')) {
  overrides.NODE_ENV = 'development';
}

//Load overrides as second priority
nconf.overrides(overrides);


//Load enviroment variables as third priority
nconf.env();


//Load the config if it exists.
nconf.file(nconf.get('config') || './config.json');


//Default variables
nconf.defaults({
  name: nconf.get('name') || 'spserver',
  NODE_ENV: 'development',
  production: {
    port: 80,
    bunyan: {
      name: nconf.get('name') || 'spserver',
      streams: [{
          stream: 'process.stdout',
          level: 'info'
        }
      ]
    },
  },
  development: {
    port: 3001,
    bunyan: {
      name: nconf.get('name') || 'spserver',
      streams: [{
          stream: 'process.stdout',
          level: 'debug'
        }
      ]
    },
  }
});

module.exports = nconf;
