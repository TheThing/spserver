'use strict';

var fs = require('fs');
var http = require('http');
var path = require('path');

var _ = require('lodash');
var nStatic = require('node-static');

var config = require('./config');
var logger = require('./logger');


// The different config sources sometimes manipulate different setting names.
// E.g. command line flags maniuplate root settings, but config files can
// manipulate settings at the prod/debug level. Resolve all of these into a
// final object of settings.
function _resolveFinalSettings(settings) {
  var finalSettings = {};
  var env = config.get('NODE_ENV');

  if (!settings) {
    settings = config.get();
  }
  if (!settings[env]) {
    settings[env] = {};
  }

  // For 'name', 'file', 'serve', 'ip', and 'port', default to the global setting rather than an
  // individual environment's setting, because it might have been set via command-line flags
  _(['name', 'file', 'serve', 'ip', 'port']).forEach(function (field) {
    finalSettings[field] = settings[field] || settings[env][field];
  });

  // For 'staticOptions', there are no command-line flags, so individual configuration options
  // override global defaults where set
  finalSettings.staticOptions = _.defaultsDeep(settings.staticOptions, settings[env].staticOptions);

  // Make a template function so we can just pass that in downstream
  finalSettings.template = (settings.template || settings[env].template) ?
    function (contents) {
      // Note: template is run with _original_, non-resolved settings
      return _.template(contents)(settings);
    } : null;

  return finalSettings;
}

function generateBase(file, finalSettings) {
  if (!file) {
    return null;
  }

  if (_.endsWith(file, 'js')) {
    return require(file);
  }

  var contents = fs.readFileSync(file);
  if (finalSettings.template) {
    contents = finalSettings.template(contents);
  }

  return function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(contents);
  };
}

var spserver = function (settings) {
  var finalSettings = _resolveFinalSettings(settings);

  var fileServer = new nStatic.Server(
    path.resolve(finalSettings.serve),
    finalSettings.staticOptions
  );

  var base = generateBase(path.resolve(finalSettings.file), finalSettings);

  var server = http.createServer(function (req, res) {
    logger.debug('[REQ]', req.method + ':', req.url);
    var startTime = new Date().getTime();

    var done = function () {
      var requestTime = new Date().getTime() - startTime;
      logger.debug('[RES]', req.method + ':', req.url,
        '(' + res.statusCode + ')', 'took', requestTime, 'ms');
    };

    res.addListener('finish', done);
    res.addListener('close', done);

    req.addListener('end', function () {
      fileServer.serve(req, res, function (err) {
        if (err) {
          if (err.status === 404 && base) {
            return base(req, res);
          } else {
            logger.error(err);

            res.writeHead(err.status, err.headers);
            res.end();
          }
        }
      });
    }).resume();
  });

  server.listen(finalSettings.port, finalSettings.ip);

  logger.info(
    'Started single-page server: ' + finalSettings.name +
    ', base file: ' + finalSettings.file +
    ', static folder: ' + finalSettings.serve +
    ', port: ' + finalSettings.port
  );

  return server;
};

spserver.generateBase = generateBase;

module.exports = spserver;
