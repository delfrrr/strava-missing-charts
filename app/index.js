/**
 * @file app entry point
 */

var express = require('express');
var passport = require('passport');
var StravaStrategy = require('passport-strava-oauth2').Strategy;
var app = express();
var program = require('commander');
var packagejson = require('./../package.json');

program
    .version(packagejson.version)
    .option('-p, --port [number]', 'port', Number, 3000)
    .option('-s, --socket [string]', 'socket/ip', String, '127.0.0.1')
    .description(packagejson.description);

program.parse(process.argv);

app.listen(program.port, program.socket, function () {
    console.log('Started at %s:%j', program.socket, program.port);
});
