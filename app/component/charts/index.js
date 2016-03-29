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
const DAY_LENGTH = 24 * 3600 * 1000;
//fitness impact
const TF = 42 * DAY_LENGTH;
//fatigue impact
// const TA = 7 * DAY_LENGTH;
const CHART_SIZE = [1040, 300];
const SVG_SIZE = [1040 + 20, 600];
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
    componentDidMount: function () {
        model.loadActivities().then((activities) => {
            /**
             * @type {TrainingImpulse[]}
             */
            var trainingImpulses = Object.keys(activities).map((id) => {
                return activities[id];
            }).filter((activity) => {
                return activity.suffer_score &&
                        activity.type === 'Ride';
            }).map((activity) => {
                return [Date.parse(activity.start_date), activity.suffer_score];
            });
            var time = trainingImpulses[0][0];
            var impulse;
            var endTime = trainingImpulses.slice(-1)[0][0];
            var fitnessAr = [];
            var dateScale = d3scale.scaleLinear()
                .domain([time, endTime])
                .range([0, CHART_SIZE[0]])
            while (time < endTime) {
                impulse = 0;
                trainingImpulses.forEach((impulseAr) => {
                    var impulseTime, impulseValue;
                    [impulseTime, impulseValue] = impulseAr;
                    if (impulseTime <= time) {
                        impulse += impulseValue * Math.exp((impulseTime - time) / TF)
                    }
                });
                fitnessAr.push([dateScale(time), impulse]);
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
            var line = d3shape.line();
            var axisX = d3axis.axisBottom(dateScale);
            var axisXYears = d3axis.axisBottom(dateScale);
            // axisX.ticks(15);
            // axisXYears.ticks(3);
            axisXYears.tickSize(0);
            axisXYears.tickSizeInner(30);
            axisX.tickSizeInner(10);
            axisX.tickSizeOuter(1);
            axisX.tickFormat((value) => {
                return moment(value).format('MMM');
            });
            axisXYears.tickFormat((value) => {
                return moment(value).format('YYYY');
            });
            // var svg = document.createElement('g');
            axisX(d3selection.select(this.refs.axisX));
            axisXYears(d3selection.select(this.refs.axisXYears));
            // console.log(svg);
            this.setState({
                fitnessLine: line(fitnessAr)
            });
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
                            ref: 'axisX'
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
