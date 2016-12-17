'use strict';

module.exports = {
  config: {
    alias: 'c',
    describe: 'Location of the config file for the server [default: config.json]'
  },
  port: {
    alias: 'p',
    describe: 'The port server should bind to [default: 3001 or 80 in production mode]'
  },
  file: {
    alias: 'f',
    describe: 'Single static file the server should serve on all unknown requests'
  },
  bunyan: {
    alias: 'b',
    describe: 'Use bunyan instead of console to log to [default: true in production mode]'
  },
  template: {
    alias: 't',
    describe: 'Parse the static file as lodash template with all options/settings being passed to it'
  },
  name: {
    alias: 'n',
    describe: 'The name for this server for logging [default: spserver]'
  },
  serve: {
    alias: 's',
    describe: 'Folder path to serve static files from [default: public]'
  },
  prod: {
    alias: 'P',
    describe: 'Force run the server in production mode'
  },
  debug: {
    alias: 'd',
    describe: 'Force run the server in development mode'
  },
  ip: {
    alias: 'i',
    describe: 'IP server runs on [default: 0.0.0.0]'
  },
};
