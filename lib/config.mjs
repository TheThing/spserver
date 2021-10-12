import fs from 'fs'
import Nconf from 'nconf-lite'

const nconf = new Nconf()

// Load arguments as highest priority
nconf.argv({ lowerCase: true, separator: '__', parseValues: true, useEqualsign: true });

// Overrides
var overrides = {};

if (nconf.get('prod')) {
  overrides.NODE_ENV = 'production';
} else if (nconf.get('debug')) {
  overrides.NODE_ENV = 'development';
}

// Load overrides as second priority
nconf.overrides(overrides);

// Load enviroment variables as third priority
nconf.env();

var filename = nconf.get('config') || '../config.json'
if (fs.existsSync(filename)) {
  // Load the config if it exists.
  nconf.file('main', nconf.get('config') || '../config.json');
}

// Default variables
nconf.defaults({
  name: nconf.get('name') || 'spserver',
  NODE_ENV: 'development',
  ip: '0.0.0.0',
  production: {
    port: 80,
    bunyan: {
      name: nconf.get('name') || 'spserver',
      stream: 'process.stdout',
      level: 'info',
    },
  },
  development: {
    port: 3001,
    bunyan: {
      name: nconf.get('name') || 'spserver',
      stream: 'process.stdout',
      level: 'debug',
    },
  },
});

export default nconf