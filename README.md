spserver
=======

spserver (or single page server) is a simple helper utlity for creating/running a server for using in pure single-page applications in true MVVM fashion without having to write any node code or using nginx or anything. This can be helpful to jump start making any single-page applications and get it running in seconds.

How it works
------------

spserver has two modes of serving files (minimum either has to be specified):

* Single file
* Static folder

When specifying a single file, all url requests will resolve with the contents of said file. This is handy for MVVM applications where the front-end javascript handles all url path routing.

When specifying a static folder, it will first look up the url request on the static folder to see if the file exists. If it doesn't, it falls back to the single file (above) or 404 (if single file was not specified).

A combination of these two will allow you to create a single base.html that will bootstrap your MVVM application with the static folder containing the javascript files. For an example, see the [nfp_www](https://github.com/nfp-projects/nfp_www) project.

API
===

`spserver(settings)`

* Settings for the server (see config below)

CLI
===

How to use
----------

```bash
npm install [-g] spserver
spserver -f ./myfile.html -s ./public -p 3000
```

Options
-------

`spserver --help`

By default, spserver will use the settings located in `config.json`. You can also override them or run it directly using only the commands below.

`--config, -c`    Location of the config file for the server [default: config.json]

`--port, -p`      The port server should bind to [default: 3001 or 80 in production mode]

`--file, -f`      Single static file the server should serve on all unknown requests

`--bunyan, -b`    Use bunyan instead of console to log to [default: true in production mode]

`--template, -t`  Parse the static file as lodash template with all options/settings being passed to it

`--name, -n`      The name for this server for logging [default: spserver]

`--serve, -s`     Folder path to serve static files from [default: public]

`--prod, -P`      Force run the server in production mode

`--debug, -d`     Force run the server in development mode

Config
======

The config file (default `config.json`) provides means to configure spserver in greater detail as well as provide optional settings to pass into our template (see template below).

A sample `config.json` file:
```
{
  "production": {
    "port": 80,
    "bunyan": {
      "name": "myserver",
      "use_bunyan": true,
      "streams": [{
        "file": "/var/log/server.log",
        "level": "info"
      }]
    }
  },
  "development": {
    "port": 5000,
    "use_bunyan": false
  }
}
```

Any of the settings in the `config.json` file can be overridden using the CLI options above.

Template
========

spserver can also help provide any additional info to your single file thanks to lodash.template. If template mode is specified, it will parse the single file first through lodash.template with the whole config file. This can allow you to specify configuration in your config file and expose them in your single file.

Example:

`config.json`
```
{
  "api": "http://api.mysite.com"
}
```

`base.html`
```
<!doctype html>
<body>
  <script>
    var apiUrl = "<%- api %>"
  </script>
  <script src="/js/lib/mithril.js"></script>
  <script src="/js/main.js"></script>
</body
```

Then you can run it like this:
`spserver -c ./config.json -t -f ./base.html -s ./public`
