'use strict';

var fs = require('fs');
var http = require('http');
var _ = require('lodash');
var nStatic = require('node-static');
var path = require('path');


var config = require('./config');
var logger = require('./logger');

var env = config.get('NODE_ENV');

var spserver = function (settings) {
  if (!settings) {
    settings = config.get();
  }
  if (!settings[env]) {
    settings[env] = {};
  }

  var fileServer = new nStatic.Server(path.resolve(settings.serve || settings[env].server));

  var base = generateBase(path.resolve(settings.file || settings[env].file), settings);

  var server = http.createServer(function (req, res) {
    logger.debug('[REQ] GET:', req.url);
    var startTime = new Date().getTime();

    var done = function () {
      var requestTime = new Date().getTime() - startTime;
      logger.debug('[RES] GET:', req.url, '(' + res.statusCode + ') took', requestTime, 'ms');
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

  server.listen(settings.port || settings[env].port);

  logger.info('Static server',
              settings.name,
              'is listening on port',
              settings.port || settings[env].port,
              'with public folder',
              settings.serve || settings[env].serve);
};

spserver.generateBase = generateBase;

function generateBase(file, settings) {
  if (!file) {
    return null;
  }

  if (_.endsWith(file, 'js')) {
    return require(file);
  }

  var contents = fs.readFileSync(file);

  if (settings.template || settings[env] && settings[env].template) {
    contents = _.template(contents)(settings);
  }

  return function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(contents);
  };
}

module.exports = spserver;
