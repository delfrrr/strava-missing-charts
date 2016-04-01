/**
 * @module component/charts
 */
'use strict';

var React = require('react');
var model = require('../../model');
const IMPULSE_TYPE = model.IMPULSE_TYPE;
var moment = require('moment');
var d3shape = require('d3-shape');
var d3axis = require('d3-axis');
var d3scale = require('d3-scale');
var d3selection = require('d3-selection');
var d3time = require('d3-time');
var chroma = require('chroma-js');
const ACTIVITY_COLORS = {
    ride:'#FFB14A',
    run:'#2EA4A8'
}
var _ = require('lodash');
const DAY_LENGTH = 24 * 3600 * 1000;
//fitness impact
const TF = 42 * DAY_LENGTH;
//fatigue impact
// const TA = 7 * DAY_LENGTH;
const CHART_SIZE = [1040, 300];
const SVG_SIZE = [1040 + 20, 600];
var line = d3shape.line();
var area = d3shape.area();
var timeScale = d3scale.scaleTime().range([0, CHART_SIZE[0]]);
var modelToggleComponent = require('../model-toggle');
var modelSelectComponent = require('../model-select');
require('react-tap-event-plugin')();
require('./charts.less');

/**
 * @typedef {Array} TrainingImpulse
 * @prop {Number} 0 - timestamp
 * @prop {Number} 1 - value
 */

/**
 * @param {Activity} activity
 * @returns {number} impulse value
 */
function getImpulse (activity) {
    switch (model.get('impulseType')) {
        case IMPULSE_TYPE.sufferScore:
            return Number(activity.suffer_score)
        case IMPULSE_TYPE.heartRate:
            return (
                (activity.average_heartrate - model.get('restHR')) /
                (model.get('maxHR') - model.get('restHR'))
            ) * activity.moving_time
    }
}

/**
 * @param {Object.<Activity.id, Activity>} activities
 * @returns {Object.<Activity.type, TrainingImpulse[]>} training impulses
 */
function getTrainingImpulses(activities) {
    var trainingImpulses = {
        run: [],
        ride: [],
        total: []
    };
    Object.keys(activities).forEach((id) => {
        var activity = activities[id];
        var ts = Date.parse(activity.start_date);
        var impulse = getImpulse(activity);
        if (impulse) {
            var item = [ts, impulse];
            trainingImpulses.total.push(item);
            if (activity.type === 'Run') {
                trainingImpulses.run.push(item);
            } else if (activity.type === 'Ride') {
                trainingImpulses.ride.push(item);
            }
        }
    });
    return trainingImpulses;
}

var component = React.createClass({
    getInitialState: function () {
        return {
            fitnessLine: null,
            loaded: false
        }
    },

    _activities: null,

    /**
     * @param {d3.scaleTime} timeScale
     */
    _updateAxis: function (timeScale) {
        var axisX = d3axis.axisBottom(timeScale);
        var axisXYears = d3axis.axisBottom(timeScale);
        axisX.tickArguments([d3time.timeMonth, 1]);
        axisXYears.tickArguments([d3time.timeYear, 1]);
        axisXYears.tickSize(0);
        axisXYears.tickPadding(35);
        axisX.tickPadding(10);
        axisX.tickSizeInner(5);
        axisX.tickSizeOuter(1);
        axisX.tickFormat((value) => {
            return moment(value).format('MMM');
        });
        axisXYears.tickFormat((value) => {
            return moment(value).format('YYYY');
        });
        axisX(d3selection.select(this.refs.axisX));
        axisXYears(d3selection.select(this.refs.axisXYears));
    },

    _updateCharts: function () {
        var trainingImpulses = getTrainingImpulses(this._activities);
        var fitness = {
            run: [],
            ride: [],
            total: []
        };
        if (trainingImpulses.total.length === 0) {
            this.setState({
                totalLine: null,
                rideArea: null,
                runArea: null
            });
            return;
        }
        var time = Math.min.apply(Math, trainingImpulses.total.map(
            (item) => {return item[0]}
        ));
        var endTime = Date.now();
        var impulse = 0;
        timeScale.domain([time, endTime]);

        while (time < endTime) {
            Object.keys(trainingImpulses).forEach((type) => {
                impulse = 0;
                trainingImpulses[type].forEach((impulseAr) => {
                    var impulseTime, impulseValue;
                    [impulseTime, impulseValue] = impulseAr;
                    if (impulseTime <= time) {
                        impulse += impulseValue * Math.exp((impulseTime - time) / TF)
                    }
                });
                fitness[type].push([timeScale(time), impulse]);
            });
            time += DAY_LENGTH;
        }
        var maxFitness = Math.max.apply(Math, fitness.total.map((fitness) => {
            return fitness[1];
        }));
        var fitnessScale = d3scale.scaleLinear()
            .domain([0, maxFitness])
            .range([0, CHART_SIZE[1]])
        _.forEach(fitness, (fitnessAr) => {
            fitnessAr.forEach((fitness) => {
                fitness[1] = fitnessScale(fitness[1]);
            });
        });
        this._updateAxis(timeScale);
        if (model.get('run') && model.get('ride')) {
            this.setState({
                totalLine: line(fitness.total),
                rideArea: area(fitness.ride),
                runArea: area(fitness.total)
            });
        } else if (model.get('run')) {
            this.setState({
                totalLine: line(fitness.run),
                rideArea: null,
                runArea: area(fitness.run)
            });
        } else if (model.get('ride')) {
            this.setState({
                totalLine: line(fitness.ride),
                rideArea: area(fitness.ride),
                runArea: null
            });
        } else {
            this.setState({
                totalLine: null,
                rideArea: null,
                runArea: null
            });
        }
    },
    componentDidMount: function () {
        model.loadActivities().then((activities) => {
            this._activities = activities;
            this.setState({
                loaded: true
            });
            this._updateCharts();
            model.on('change', this._updateCharts);
        });
    },
    render: function () {
        return React.DOM.div(
            {
                className: 'charts'
            },
            !this.state.loaded &&
                React.DOM.div(
                    null,
                    'Loading charts...'
                ),
            this.state.loaded &&
                React.DOM.div(
                    {
                        className: 'charts__controls'
                    },
                    React.DOM.div(
                        {
                            className: 'charts__toggle'
                        },
                        modelToggleComponent({
                            label: 'Ride',
                            modelField: 'ride'
                        })
                    ),
                    React.DOM.div(
                        {
                            className: 'charts__toggle'
                        },
                        modelToggleComponent({
                            label: 'Run',
                            modelField: 'run'
                        })
                    ),
                    React.DOM.div(
                        {
                            className: 'charts__select charts__select_type_impulse'
                        },
                        modelSelectComponent({
                            modelField: 'impulseType',
                            options: [
                                {value: IMPULSE_TYPE.sufferScore, primaryText: 'Suffer Score'},
                                {value: IMPULSE_TYPE.heartRate, primaryText:'TRIMP'}
                            ]
                        })
                    )
                ),
            React.DOM.svg(
                {
                    viewBox: `0 0 ${SVG_SIZE[0]} ${SVG_SIZE[1]}`,
                    width: SVG_SIZE[0],
                    height: SVG_SIZE[1],
                    className: 'charts__svg',
                    ref: 'svg'
                },
                this.state.runArea &&
                React.DOM.path(
                    {
                        d: this.state.runArea,
                        strokeWidth: '0',
                        fill: chroma(ACTIVITY_COLORS.run).luminance(0.9).css(),
                        transform: `matrix(1 0 0 -1 0 ${CHART_SIZE[1]})`
                    }
                ),
                this.state.rideArea &&
                React.DOM.path(
                    {
                        d: this.state.rideArea,
                        strokeWidth: '0',
                        fill: chroma(ACTIVITY_COLORS.ride).luminance(0.8).css(),
                        transform: `matrix(1 0 0 -1 0 ${CHART_SIZE[1]})`
                    }
                ),
                this.state.totalLine &&
                React.DOM.path(
                    {
                        d: this.state.totalLine,
                        strokeStyle: 'solid',
                        strokeWidth: '1.5px',
                        stroke: '#000000',
                        fill: 'transparent',
                        transform: `matrix(1 0 0 -1 0 ${CHART_SIZE[1]})`
                    }
                ),
                React.DOM.g(
                    {
                        transform: `matrix(1 0 0 1 0 ${CHART_SIZE[1]})`
                    },
                    React.DOM.g(
                        {
                            ref: 'axisX',
                            className: 'charts__axis-x'
                        }
                    ),
                    React.DOM.g(
                        {
                            ref: 'axisXYears'
                        }
                    )
                )
            )
        );
    }
});

module.exports = React.createFactory(component);
