/**
 * form with token input
 * @module component/login
 */
'use strict'

var React = require('react');
var textFieldComponent = React.createFactory(require('material-ui').TextField);
var buttonComponent = React.createFactory(require('material-ui').RaisedButton);
var model = require('../../model');
require('./login.less');
var component = React.createClass({
    _onSubmit: function (e) {
        model.set('token', this.state.token);
        model.updateAthlete().done();
        e.preventDefault();
    },
    getInitialState: function () {
        return {
            token: model.get('token')
        };
    },
    render: function () {
        return React.DOM.form(
            {
                className: 'login',
                action: '/',
                onSubmit: this._onSubmit
            },
            React.DOM.div(
                {
                    className: 'login__about'
                },
                'Copy token from ',
                React.DOM.a(
                    {
                        target: '_blank',
                        href: 'http://www.strava.com/settings/api'
                    },
                    'Strava API application settings'
                ),
                ' page'
            ),
            React.DOM.div(
                {
                    className: 'login__token'
                },
                textFieldComponent(
                    {
                        name: 'token',
                        floatingLabelText: 'Strava token',
                        style: {
                            width: '100%'
                        },
                        value: this.state.token,
                        onChange: (e) => {
                            this.setState({token: e.target.value})
                        }
                    }
                )
            ),
            React.DOM.div(
                {
                    className: 'login__save-button'
                },
                buttonComponent(
                    {
                        name: 'save-button',
                        type: 'submit'
                    },
                    'Save'
                )
            )
        )
    }
});

module.exports = React.createFactory(component);
