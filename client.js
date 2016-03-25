/**
 * @file entry for client app
 */

var ReactDOM = require('react-dom');
var React = require('react');
var _  = require('lodash');
var appHolder = document.createElement('span');
var cookies = require('cookies-js');
var token = cookies.get('token');

//becouse we putted scripts into the head
window.addEventListener('load', _.once(function () {
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(appHolder);
    ReactDOM.render(React.DOM.div(
        {
            className: 'client'
        },
        token ?
        React.DOM.div(
            null,
            'load routes'
        ) :
        React.DOM.a(
            {
                href: '/auth'
            },
            'Login with Strava'
        )
    ), appHolder);
}));
