/**
 * @module component/charts
 */
'use strict';

var React = require('react');
var model = require('../../model');
var moment = require('moment');
var d3shape = require('d3-shape');
var d3axis = require('d3-axis');
var d3scale = require('d3-scale');
var d3selection = require('d3-selection');
var d3time = require('d3-time');
const DAY_LENGTH = 24 * 3600 * 1000;
//fitness impact
const TF = 42 * DAY_LENGTH;
//fatigue impact
// const TA = 7 * DAY_LENGTH;
const CHART_SIZE = [1040, 300];
const SVG_SIZE = [1040 + 20, 600];
var line = d3shape.line();
var timeScale = d3scale.scaleTime().range([0, CHART_SIZE[0]]);
require('./charts.less');

/**
 * @typedef {Array} TrainingImpulse
 * @prop {Number} 0 - timestamp
 * @prop {Number} 1 - value
 */

var component = React.createClass({
    getInitialState: function () {
        return {
            fitnessLine: null
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
        /**
         * @type {TrainingImpulse[]}
         */
        var trainingImpulses = Object.keys(this._activities).map((id) => {
            return this._activities[id];
        }).filter((activity) => {
            return activity.suffer_score;
        }).map((activity) => {
            return [Date.parse(activity.start_date), activity.suffer_score];
        });
        var time = trainingImpulses[0][0];
        var impulse;
        var endTime = Date.now();
        timeScale.domain([time, endTime]);

        /**
         * time, impulse sum pairs
         * @type {Array.<{{0: number, 1: number}}>}
         */
        var fitnessAr = [];

        while (time < endTime) {
            impulse = 0;
            trainingImpulses.forEach((impulseAr) => {
                var impulseTime, impulseValue;
                [impulseTime, impulseValue] = impulseAr;
                if (impulseTime <= time) {
                    impulse += impulseValue * Math.exp((impulseTime - time) / TF)
                }
            });
            fitnessAr.push([timeScale(time), impulse]);
            time += DAY_LENGTH;
        }
        var maxFitness = Math.max.apply(Math, fitnessAr.map((fitness) => {
            return fitness[1];
        }));
        var fitnessScale = d3scale.scaleLinear()
            .domain([0, maxFitness])
            .range([0, CHART_SIZE[1]])
        fitnessAr.forEach((fitness) => {
            fitness[1] = fitnessScale(fitness[1]);
        });
        this._updateAxis(timeScale);
        this.setState({
            fitnessLine: line(fitnessAr)
        });
    },
    componentDidMount: function () {
        model.loadActivities().then((activities) => {
            this._activities = activities;
            this._updateCharts();
        });
    },
    render: function () {
        return React.DOM.div(
            {
                className: 'charts'
            },
            !this.state.fitnessLine &&
                React.DOM.div(
                    null,
                    'Loading charts...'
                ),
            React.DOM.svg(
                {
                    viewBox: `0 0 ${SVG_SIZE[0]} ${SVG_SIZE[1]}`,
                    width: SVG_SIZE[0],
                    height: SVG_SIZE[1],
                    className: 'charts__svg',
                    ref: 'svg'
                },
                this.state.fitnessLine &&
                    React.DOM.path(
                        {
                            d: this.state.fitnessLine,
                            strokeStyle: 'solid',
                            strokeWidth: '1px',
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
