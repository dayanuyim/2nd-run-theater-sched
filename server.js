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
console.log(`NODE_DEV ${NODE_ENV}`);

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
if (isDev) {
  // Use FileStore in development mode.
  const FileStore = require('session-file-store')(expressSession);
  app.use(expressSession({
    resave: false,
    saveUninitialized: true,
    secret: 'unguessable',
    store: new FileStore(),
  }));
}
else {
  // Use RedisStore in production mode.
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

// Passport Authentication.
/*
const __profileSample = {
  id: '10216065177736520',
  username: undefined,
  displayName: '蔡宗達',
  name:
   { familyName: undefined,
     givenName: undefined,
     middleName: undefined },
  gender: undefined,
  profileUrl: undefined,
  provider: 'facebook',
  _raw: '{"name":"\\u8521\\u5b97\\u9054","id":"10216065177736520"}'
};
*/
/*
const passport = require('passport');
passport.serializeUser((profile, done) => done(null, {
    id: profile.id,
    provider: profile.provider,
}));
passport.deserializeUser((user, done) => done(null, user));
app.use(passport.initialize());
app.use(passport.session());

// Facebook auth
const FacebookStrategy = require('passport-facebook').Strategy;
passport.use(new FacebookStrategy({
  clientID: nconf.get('auth:facebook:appID'),
  clientSecret: nconf.get('auth:facebook:appSecret'),
  callbackURL: new URL('/auth/facebook/callback', serviceUrl).href,
}, (accessToken, refreshToken, profile, done) => done(null, profile)));
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/',
}))

app.get('/api/session', (req, res) => {
  const session = {auth: req.isAuthenticated()};
  res.status(200).json(session);
});

app.get('/auth/signout', (req, res) => {
  req.logout();
  res.redirect('/');
})
*/

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

