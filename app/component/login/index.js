/**
 * form with token input
 * @module component/login
 */
'use strict'

var React = require('react');
var textFieldComponent = React.createFactory(require('material-ui').TextField);
var buttonComponent = React.createFactory(require('material-ui').RaisedButton);
require('./login.less');
var component = React.createClass({
    render: function () {
        return React.DOM.div(
            {
                className: 'login'
            },
            React.DOM.div(
                {
                    className: 'login__token'
                },
                textFieldComponent(
                    {
                        name: 'token',
                        floatingLabelText: 'Strava token'
                    }
                )
            ),
            React.DOM.div(
                {
                    className: 'login__save-button'
                },
                buttonComponent(
                    {
                        name: 'save-button'
                    },
                    'Save'
                )
            )
        )
    }
});

module.exports = React.createFactory(component);
