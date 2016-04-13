/**
 * @module component/charts
 */
'use strict';

var React = require('react');
var model = require('../../model');
const METRIC_TYPE = model.METRIC_TYPE;
var d3scale = require('d3-scale');
var toolbarComponent = require('./../toolbar');
var irChartComponent = require('./../ir-chart');
var tiChartComponent = require('./../ti-chart');
var rpChartComponent = require('./../rp-chart');
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
const RIDING_PERFOMANCE_CHART_HEIGHT = 300;
const SVG_PADDING = [0, 20, 80, 20];
var timeScale = d3scale.scaleTime().range([0, CHART_SIZE[0]]);
require('react-tap-event-plugin')();
require('./charts.less');

/**
 * @typedef {Array} TrainingImpulse
 * @prop {Number} 0 - timestamp
 * @prop {Number} 1 - trainingImpulse
 * @prop {Activity.id} 2
 */

/**
 * @typedef {Array} Metric
 * @prop {Number} 0 - x
 * @prop {Number} 1 - y
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
 * calculates current metric and scales it for screen
 * @param {Object.<,trainingImpulse[]>} trainingImpulses
 * @param {Object.<string,Metric[]>}
 */
function getMetrics (trainingImpulses) {
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

    return metrics;
}

var component = React.createClass({
    render: function () {
        var trainingImpulses = model.get('trainingImpulses');
        var rideRoutes = model.get('rideRoutes');
        var metrics;
        if (trainingImpulses) {
            metrics = getMetrics(trainingImpulses);
        }
        return React.DOM.div(
            {
                className: 'charts'
            },
            !metrics &&
                React.DOM.div(
                    null,
                    'Loading charts...'
                ),
            metrics && toolbarComponent(),
            metrics && React.DOM.svg(
                {
                    viewBox: [
                        -1 * SVG_PADDING[3],
                        -1 * SVG_PADDING[0],
                        CHART_SIZE[0] + SVG_PADDING[1],
                        CHART_SIZE[1] +
                            SVG_PADDING[2] +
                            TRAINING_IMPULSE_CHART_HEIGH +
                            RIDING_PERFOMANCE_CHART_HEIGHT
                    ].join(' '),
                    width: CHART_SIZE[0] + SVG_PADDING[1] + SVG_PADDING[3],
                    height: CHART_SIZE[1] +
                        SVG_PADDING[0] +
                        SVG_PADDING[2] +
                        TRAINING_IMPULSE_CHART_HEIGH +
                        RIDING_PERFOMANCE_CHART_HEIGHT,
                    className: 'charts__svg',
                    ref: 'svg'
                },
                irChartComponent({
                    metrics: metrics,
                    activityColors: ACTIVITY_COLORS,
                    height: CHART_SIZE[1]
                }),
                React.DOM.g(
                    {
                        transform: `translate(0, ${CHART_SIZE[1]})`
                    },
                    tiChartComponent({
                        activityColors: ACTIVITY_COLORS,
                        trainingImpulses,
                        timeScale,
                        height: TRAINING_IMPULSE_CHART_HEIGH
                    })
                ),
                rideRoutes && React.DOM.g(
                    {
                        transform: `translate(0, ${CHART_SIZE[1] + TRAINING_IMPULSE_CHART_HEIGH})`
                    },
                    rpChartComponent({
                        height: RIDING_PERFOMANCE_CHART_HEIGHT,
                        rideRoutes,
                        timeScale
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
