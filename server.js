/***
 * Excerpted from "Node.js 8 the Right Way",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/jwnode2 for more book information.
***/
'use strict';
const pkg = require('./package.json');
const {URL} = require('url');
const path = require('path');
const fs = require('fs');

// nconf configuration.
const nconf = require('nconf');
nconf
  .argv()
  .env('__')
  .defaults({NODE_ENV: 'development'})
  .add('defaults2', { type: 'literal', store: {
     conf: path.join(__dirname, `${nconf.get('NODE_ENV')}.config.json`)
  }})
  .file(nconf.get('conf'));

const NODE_ENV = nconf.get('NODE_ENV');
const isDev = NODE_ENV === 'development';
console.log(`NODE_ENV ${NODE_ENV}`);

const serviceUrl = new URL(nconf.get('serviceUrl'));
const isHttps = serviceUrl.protocol === 'https:';
const servicePort = serviceUrl.port || (isHttps? 443 : 80);

// Express and middleware.
const express = require('express');
const app = express();

const morgan = require('morgan');
app.use(morgan('dev'));
app.get('/api/version', (req, res) => res.status(200).json(pkg.version));

const expressSession = require('express-session');
if(nconf.get('redis')){
  const RedisStore = require('connect-redis')(expressSession);
  app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: nconf.get('redis:secret'),
    store: new RedisStore({
      host: nconf.get('redis:host'),
      port: nconf.get('redis:port'),
    }),
  }));
}
else {
  const FileStore = require('session-file-store')(expressSession);
  app.use(expressSession({
    resave: false,
    saveUninitialized: true,
    secret: 'unguessable',
    store: new FileStore(),
  }));
}


// Serve webpack assets.
if (isDev) {
  const webpack = require('webpack');
  const webpackMiddleware = require('webpack-dev-middleware');
  const webpackConfig = require('./webpack.config.js');
  app.use(webpackMiddleware(webpack(webpackConfig), {
    publicPath: '/',
    stats: {colors: true},
  }));
} else {
  app.use(express.static('dist'));
}

// import lib router
app.use('/api', require('./lib/theater.js')());

// Startup Server
if(isHttps){
  const https = require('https');
  const httpsOptions = {
    key: fs.readFileSync(nconf.get('security:key')),
    cert: fs.readFileSync(nconf.get('security:cert'))
  };
  https.createServer(httpsOptions, app)
      .listen(servicePort, () => console.log(`Security Server on Port ${serviceUrl}`));
}
else{
  app.listen(servicePort, () => console.log(`Server on Port ${serviceUrl}`));
}


