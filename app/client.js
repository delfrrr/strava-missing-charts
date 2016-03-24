/**
 * @file entry for client app
 */

var ReactDOM = require('react-dom');
var React = require('react');
var _  = require('lodash');
var appHolder = document.createElement('span');

//becouse we putted scripts into the head
window.addEventListener('load', _.once(function () {
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(appHolder);
    ReactDOM.render(React.DOM.div(
        {
            className: 'client'
        },
        React.DOM.a(
            {
                href: '/auth'
            },
            'Login with Strava'
        )
    ), appHolder);
}));
