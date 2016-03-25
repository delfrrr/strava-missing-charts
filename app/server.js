/**
 * @file app entry point
 */

'use strict';

var express = require('express');
var app = express();
var program = require('commander');
var React = require('react');
var ReactDomServer = require('react-dom/server');
var webpackMiddleware = require('webpack-dev-middleware');
var webpack = require('webpack');
var _ = require('lodash');

const packagejson = require('../package.json');
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const CALLBACK_PATH = '/auth/callback';

var oauth2 = require('simple-oauth2')({
    clientID: STRAVA_CLIENT_ID,
    clientSecret: STRAVA_CLIENT_SECRET,
    site: 'https://www.strava.com',
    tokenPath: '/oauth/token',
    authorizationPath: '/oauth/authorize'
});


program
    .version(packagejson.version)
    .option('-p, --port [number]', 'port', Number, 3000)
    .option('-s, --socket [string]', 'socket/ip', String, '127.0.0.1')
    .option('-h, --host [string]', 'host', String, '127.0.0.1')
    .description(packagejson.description);

program.parse(process.argv);

const REDIRECT_URI = `http://${program.host}:${program.port}${CALLBACK_PATH}`;
var authorizationUri = oauth2.authCode.authorizeURL({
    redirect_uri: REDIRECT_URI,
    scope: 'public',
    state: '3(#0/!~'//TODO: wtf?
});

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

app.use(require('cookie-parser')());

//main app page
app.get('/', function (req, res) {
    res.type('html');
    res.send(render());
});

//redirect to strava auth
app.get('/auth', function (req, res) {
    res.redirect(authorizationUri);
});

//oauth callback
app.get(CALLBACK_PATH, function (req, res) {
    var code = req.query.code;
    oauth2.authCode.getToken({
        code: code,
        redirect_uri: REDIRECT_URI
    }, function (err, result) {
        if (err) {
            console.error(err);
        } else {
            res.cookie('token', result.access_token, {expires: 0})
        }
        res.redirect('/');
    });
});

app.listen(program.port, program.socket, function () {
    console.log('Started at %s:%j', program.socket, program.port);
});
