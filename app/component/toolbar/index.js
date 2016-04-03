/**
 * @module component/toolbar
 */
'use strict';

var React = require('react');
var model = require('../../model');
var modelToggleComponent = require('../model-toggle');
var modelSelectComponent = require('../model-select');
const IMPULSE_TYPE = model.IMPULSE_TYPE;
const METRIC_TYPE = model.METRIC_TYPE;

require('./toolbar.less');

var component = React.createClass({
    render: function () {
        return React.DOM.div(
            {
                className: 'toolbar'
            },
            React.DOM.div(
                {
                    className: 'toolbar__toggle'
                },
                modelToggleComponent({
                    label: 'Ride',
                    modelField: 'ride'
                })
            ),
            React.DOM.div(
                {
                    className: 'toolbar__toggle'
                },
                modelToggleComponent({
                    label: 'Run',
                    modelField: 'run'
                })
            ),
            React.DOM.div(
                {
                    className: 'toolbar__select toolbar__select_type_impulse'
                },
                modelSelectComponent({
                    modelField: 'impulseType',
                    options: [
                        {value: IMPULSE_TYPE.sufferScore, primaryText: 'Suffer Score'},
                        {value: IMPULSE_TYPE.heartRate, primaryText:'TRIMP'}
                    ]
                })
            ),
            React.DOM.div(
                {
                    className: 'toolbar__select toolbar__select_type_metric'
                },
                modelSelectComponent({
                    modelField: 'metric',
                    options: [
                        {value: METRIC_TYPE.fitness, primaryText: 'Fitness'},
                        {value: METRIC_TYPE.form, primaryText: 'Form'}
                    ]
                })
            )
        );
    }
});

module.exports = React.createFactory(component);
