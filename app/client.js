/**
 * @file entry for client app
 */

var ReactDOM = require('react-dom');
var React = require('react');
var _  = require('lodash');
var appHolder = document.createElement('span');
var model = require('./model');
var routesComponent = require('./components/routes');
require('./client.less');
var component = React.createClass({
    getInitialState: function () {
        return {
            token: model.get('token')
        }
    },
    render: function () {
        return React.DOM.div(
            {
                className: 'client'
            },
            this.state.token ?
            routesComponent(
                null
            ) :
            React.DOM.a(
                {
                    href: '/auth'
                },
                'Login with Strava'
            )
        );
    }
});

//becouse we putted scripts into the head
window.addEventListener('load', _.once(function () {
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(appHolder);
    ReactDOM.render(React.createElement(
        component,
        null
    ), appHolder);
}));
