/**
 * @module component/charts
 */
'use strict';

var React = require('react');
var model = require('../../model');
const IMPULSE_TYPE = model.IMPULSE_TYPE;
const METRIC_TYPE = model.METRIC_TYPE;
var d3scale = require('d3-scale');
var toolbarComponent = require('./../toolbar');
var irChartComponent = require('./../ir-chart');
var tiChartComponent = require('./../ti-chart');
var xAxisComponent = require('./../x-axis');
const ACTIVITY_COLORS = {
    ride:'#FFB14A',
    run:'#2EA4A8'
}
var _ = require('lodash');
const DAY_LENGTH = 24 * 3600 * 1000;

//fitness impact
const TF = 42 * DAY_LENGTH;
const KF = 1;

//fatigue impact
const TA = 7 * DAY_LENGTH;
const KA = 2;

const CHART_SIZE = [1040, 300];
const TRAINING_IMPULSE_CHART_HEIGH = 100;
const SVG_PADDING = [0, 20, 80, 20];
var timeScale = d3scale.scaleTime().range([0, CHART_SIZE[0]]);
require('react-tap-event-plugin')();
require('./charts.less');

/**
 * @typedef {Array} TrainingImpulse
 * @prop {Number} 0 - timestamp
 * @prop {Number} 1 - value
 */


/**
 * @param {TrainingImpulse[]} trainingImpulses
 * @param {Number} time
 * @return {Number} metric value
 */
function getMetricValue(trainingImpulses, time) {
    var value = 0;
    var metric = model.get('metric');
    trainingImpulses.forEach((impulseAr) => {
        var impulseTime, impulseValue;
        [impulseTime, impulseValue] = impulseAr;
        if (impulseTime <= time) {
            switch (metric) {
                case METRIC_TYPE.fitness:
                    value += KF * impulseValue * Math.exp((impulseTime - time) / TF)
                    break;
                case METRIC_TYPE.form:
                    value += (
                        KF * impulseValue * Math.exp((impulseTime - time) / TF) -
                        KA * impulseValue * Math.exp((impulseTime - time) / TA)
                    );
                    if (value < 0) {
                        value = 0;
                    }
                    break;
            }
        }
    });
    return value;
}

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

    _updateCharts: function () {
        var trainingImpulses = getTrainingImpulses(this._activities);
        var metrics = {
            run: [],
            ride: [],
            total: []
        };

        //find start time
        var time = Math.min.apply(Math, trainingImpulses.total.map(
            (item) => {return item[0]}
        ));

        var endTime = Date.now() + DAY_LENGTH;

        timeScale.domain([time, endTime]);

        //calculate value for each day
        while (time < endTime) {
            Object.keys(trainingImpulses).forEach((type) => {
                let value = getMetricValue(trainingImpulses[type], time);
                metrics[type].push([timeScale(time), value]);
            });
            time += DAY_LENGTH;
        }

        var maxValue = Math.max.apply(Math, metrics.total.map((fitness) => {
            return fitness[1];
        }));

        var scaleX = d3scale.scaleLinear()
            .domain([0, maxValue])
            .range([0, CHART_SIZE[1]]);

        //scale values to fit chart
        _.forEach(metrics, (metricAr) => {
            metricAr.forEach((metricValue) => {
                metricValue[1] = scaleX(metricValue[1]);
            });
        });

        this.setState({
            metrics,
            trainingImpulses
        });
    },
    componentDidMount: function () {
        model.loadActivities().then((activities) => {
            this._activities = activities;
            this._updateCharts();
            model.on('change', this._updateCharts);
        });
    },
    render: function () {
        return React.DOM.div(
            {
                className: 'charts'
            },
            !this.state.metrics &&
                React.DOM.div(
                    null,
                    'Loading charts...'
                ),
            this.state.metrics && toolbarComponent(),
            this.state.metrics && React.DOM.svg(
                {
                    viewBox: `${-1 * SVG_PADDING[3]} ${-1 * SVG_PADDING[0]} ${CHART_SIZE[0] + SVG_PADDING[1]} ${CHART_SIZE[1] + SVG_PADDING[2] + TRAINING_IMPULSE_CHART_HEIGH}`,
                    width: CHART_SIZE[0] + SVG_PADDING[1] + SVG_PADDING[3],
                    height: CHART_SIZE[1]  + SVG_PADDING[0] + SVG_PADDING[2] + TRAINING_IMPULSE_CHART_HEIGH,
                    className: 'charts__svg',
                    ref: 'svg'
                },
                irChartComponent({
                    metrics: this.state.metrics,
                    activityColors: ACTIVITY_COLORS,
                    height: CHART_SIZE[1]
                }),
                React.DOM.g(
                    {
                        transform: `translate(0, ${CHART_SIZE[1]})`
                    },
                    tiChartComponent({
                        activityColors: ACTIVITY_COLORS,
                        trainingImpulses: this.state.trainingImpulses,
                        timeScale,
                        height: TRAINING_IMPULSE_CHART_HEIGH
                    })
                ),
                xAxisComponent({
                    irChartHeight: CHART_SIZE[1],
                    tiChartHeight: TRAINING_IMPULSE_CHART_HEIGH,
                    timeScale
                })
            )
        );
    }
});

module.exports = React.createFactory(component);
