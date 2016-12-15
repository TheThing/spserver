#!/usr/bin/env node
'use strict';

var config = require('./lib/config');
var server = require('./lib/spserver');

var env = config.get('NODE_ENV');

//Check if we any 
var displayHelp = config.get('help');
if (!config.get('file') && !config.get(env + ':file') &&
    !config.get('serve') && !config.get(env + ':serve')) {
  displayHelp = true;
}

if (displayHelp) {
  console.log('Run static server for static files, simple servers or pure MVVM projects.');
  console.log('Specifying either file or folder serving is required.');
  console.log('');
  console.log('Usage:');
  console.log('  spserver [options]');
  console.log('');
  console.log(config.stores.argv.help());
  console.log('Examples:');
  console.log('  spserver -p 2000 -f base.html -s ./dist');
  console.log('');
  console.log('  Will run the server on port 2000 serving static files from the ./dist folder');
  console.log('  with any unknown file being served the contents of base.html.');
  console.log('');
  console.log('  spserver -f base.html -t --custom test');
  console.log('');
  console.log('  Will run the server with the base.html as a template as well as');
  console.log('  passing the contents of "test" argument into the template.');

  process.exit(0);
}

//Run our server \o/
server();
