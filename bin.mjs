#!/usr/bin/env node

import config from './lib/config.mjs'
import SPServer from './lib/spserver.mjs'

var env = config.get('NODE_ENV');

//Check if we any 
var displayHelp = config.get('help');
if (!config.get('file') && !config.get(env + ':file') &&
    !config.get('serve') && !config.get(env + ':serve')) {
  displayHelp = true;
}

if (displayHelp) {
  console.log(`Run static server for static files, simple servers or pure MVVM projects.
Specifying either file or folder serving is required.

Usage:
  spserver [options]

Options:
  --config           Location of the config file for the server [default:
                     config.json]
  --port             The port server should bind to [default: 3001 or 80 in
                     production mode]
  --file             Single static file the server should serve on all unknown
                     requests
  --bunyan           Use bunyan instead of console to log to [default: true in
                     production mode]
  --template         Parse the static file as lodash template with all
                     options/settings being passed to it
  --name             The name for this server for logging [default: spserver]
  --serve            Folder path to serve static files from [default: public]
  --prod             Force run the server in production mode
  --debug            Force run the server in development mode
  --ip               IP server runs on [default: 0.0.0.0]
  --rooturlpath      Root URL path server is deployed on; will be removed from
                     URL when resolving to files [default: /]

Examples:
  spserver -p 2000 -f base.html -s ./dist

  Will run the server on port 2000 serving static files from the ./dist folder
  with any unknown file being served the contents of base.html.

  spserver -f base.html -t --custom test

  Will run the server with the base.html as a template as well as
  passing the contents of "test" argument into the template.`);
  process.exit(0);
}

//Run our server \o/

let server = new SPServer()
