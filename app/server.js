/**
 * @file app entry point
 */

'use strict';

var express = require('express');
var passport = require('passport');
var StravaStrategy = require('passport-strava-oauth2').Strategy;
var app = express();
var program = require('commander');
var React = require('react');
var ReactDomServer = require('react-dom/server');
var webpackMiddleware = require('webpack-dev-middleware');
var webpack = require('webpack');
var _ = require('lodash');
const packagejson = require('./../package.json');

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

program
    .version(packagejson.version)
    .option('-p, --port [number]', 'port', Number, 3000)
    .option('-s, --socket [string]', 'socket/ip', String, '127.0.0.1')
    .option('-h, --host [string]', 'host', String, '127.0.0.1')
    .description(packagejson.description);

program.parse(process.argv);

passport.use(
    new StravaStrategy({
        clientID: STRAVA_CLIENT_ID,
        clientSecret: STRAVA_CLIENT_SECRET,
        callbackURL: `http://${program.host}:${program.port}/auth/strava/callback`
    },
    function(accessToken, refreshToken, profile, done) {
        console.log('login', accessToken, refreshToken, profile);
        done();
    })
);

app.use(passport.initialize());

function render() {
    return ReactDomServer.renderToStaticMarkup(
        React.DOM.html(
            null,
            React.DOM.head(
                null,
                React.DOM.title(
                    null,
                    packagejson.name
                ),
                React.DOM.script(
                    null,
                    'window.__DEV__ = true;'
                ),
                React.DOM.script({
                    src: '//cdnjs.cloudflare.com/ajax/libs/react/0.14.7/react.js'
                }),
                React.DOM.script({
                    src: '//cdnjs.cloudflare.com/ajax/libs/react/0.14.7/react-dom.js'
                }),
                React.DOM.script({
                    src: '/app/client.js'
                })
            ),
            React.DOM.body(null, '')
        )
    );
}

//TODO: find way to not override output
var webpackConfig = _.assign({}, require('../webpack.config'), {
    output: {
        path: '/',
        filename: '/app/[name].js',
        pathinfo: true
    }
});

app.use(webpackMiddleware(webpack(webpackConfig), {
    publicPath: '/'
}));

app.get('/', function (req, res) {
    res.type('html');
    res.send(render());
});

app.listen(program.port, program.socket, function () {
    console.log('Started at %s:%j', program.socket, program.port);
});
