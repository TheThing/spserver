'use strict';

var fs = require('fs');
var http = require('http');
var _ = require('lodash');
var nStatic = require('node-static');


var config = require('./config');
var logger = require('./logger');

var env = config.get('NODE_ENV');
var fileServer = new nStatic.Server(config.get('serve') || config.get(env + ':serve'));

module.exports = function(settings) {
  if (!settings) {
    settings = config.get();
  }
  if (!settings[env]) {
    settings[env] = {};
  }

  var base = generateBase(settings.file || settings[env].file, settings);

  var server = http.createServer(function (req, res) {
    logger.debug('[REQ] GET:', req.url);
    var startTime = new Date().getTime();

    var done = function() {
      var requestTime = new Date().getTime() - startTime;
      logger.debug('[RES] GET:', req.url, '(' + res.statusCode + ') took', requestTime, 'ms');
    };

    res.addListener('finish', done);
    res.addListener('close', done);

    //return base(req, res);
    req.addListener('end', function () {
      fileServer.serve(req, res, function(e) {
        if (!e) return;
        if (e && e.status === 404 && base) {
          return base(req, res);
        }
        logger.error(e);
        res.writeHead(404);
        res.end();
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

function generateBase(file, settings) {
  if (!file) {
    return null;
  }

  if (_.endsWith(file, 'js')) {
    return require(file);
  }

  var contents = fs.readFileSync(file);

  if (settings.template || settings[env].template) {
    contents = _.template(contents)(settings);
  }

  return function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(contents);
  };
}
