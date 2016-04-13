/**
 * @file entry for client app
 */

var ReactDOM = require('react-dom');
var React = require('react');
var _  = require('lodash');
var appHolder = document.createElement('span');
var model = require('./model');
var loginComponent = require('./component/login');
var chartsComponent = require('./component/charts');
require('./client.less');
var component = React.createClass({
    getInitialState: function () {
        return model.toJSON();
    },
    componentDidMount: function () {
        model.on('change', () => {
            this.setState(model.toJSON());
            model.save();
            if (model.get('fullRideActivities')) {
                model.updateRideRoutes();
            }
        });
        model.fetch();
        model.on('change:impulseType', model.updateTrainingImpulses, model);
        model.on('change:token', model.updateAthlete, model);
        model.on('change:athlete', model.loadActivities, model);
        model.on('change:activities', model.updateTrainingImpulses, model);
    },
    render: function () {
        return React.DOM.div(
            {
                className: 'client'
            },
            this.state.athlete ?
            chartsComponent() :
            loginComponent()
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
