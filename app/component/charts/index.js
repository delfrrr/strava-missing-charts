/**
 * @module component/charts
 */
'use strict';

var React = require('react');
var model = require('../../model');
var component = React.createClass({
    componentDidMount: function () {
        model.loadActivities();
    },
    render: function () {
        return React.DOM.div(
            null,
            'chartss'
        );
    }
});

module.exports = React.createFactory(component);
