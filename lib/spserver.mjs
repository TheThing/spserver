import fs from 'fs'
import http from 'http'
import path from 'path'
import url from 'url'
import _ from 'lodash'
import nStatic from 'node-static'

import config from './config.mjs'
import logger from './logger.mjs'


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

  finalSettings.rooturlpath = config.get('rooturlpath') || config.get('ROOT_URL_PATH') || '/';

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

function _rerouteRootUrl(reqUrl, rootUrl) {
  var parsedUrl = url.parse(reqUrl);

  parsedUrl.pathname = path.normalize(
    parsedUrl.pathname.replace(rootUrl, '/') || '/'
  );

  return url.format(parsedUrl);
}

class SPServer {
  constructor(settings, opts = {}) {
    Object.assign(this, {
      fs: opts.fs || fs,
    })

    var finalSettings = _resolveFinalSettings(settings);

    var fileServer = new nStatic.Server(
      path.resolve(finalSettings.serve),
      finalSettings.staticOptions
    );

    var base = SPServer.generateBase(finalSettings.file ? path.resolve(finalSettings.file) : null, finalSettings);

    var server = http.createServer(function (req, res) {
      var startTime = new Date().getTime();

      var isFinished = false
      var done = function () {
        if (isFinished) return
        isFinished = true
        var requestTime = new Date().getTime() - startTime;
        logger.debug('[RES]', req.method + ':', '(' + res.statusCode + ')', req.url,
          'took', requestTime, 'ms');
      };

      req.url = _rerouteRootUrl(req.url, finalSettings.rooturlpath);

      res.addListener('finish', done);
      res.addListener('close', done);

      req.addListener('end', function () {
        fileServer.serve(req, res, function (err) {
          if (err) {
            if (err.status === 404 && base) {
              return base(req, res);
            } else if (err.status === 404) {
              res.writeHead(err.status, err.headers);
              res.end(err.message);
            } else {
              logger.debug('[REQ]', req.method + ':', req.url);
              logger.error(err);

              res.writeHead(err.status, err.headers);
              res.end(err.message);
            }
          }
        });
      }).resume();
    });

    server.listen(finalSettings.port, finalSettings.ip);

    logger.info(
      'Started single-page server: ' + finalSettings.name +
      ', base file: ' + (finalSettings.file || '<none>') +
      ', static folder: ' + finalSettings.serve +
      ', port: ' + finalSettings.port
    );

    this.server = server
  }

  static generateBase(file, finalSettings, useFs = fs) {
    if (!file) {
      return null;
    }
  
    if (_.endsWith(file, 'js')) {
      throw new Error('javascript file has been deprecated')
    }

    var contents = useFs.readFileSync(file, { encoding: 'utf-8' });
    if (finalSettings.template) {
      contents = finalSettings.template(contents)
    }
  
    return function(req, res) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(contents);
    };
  }
};

export default SPServer;
