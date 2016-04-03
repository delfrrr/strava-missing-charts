/**
 * @module x-axis
 */
'use strict';

var React = require('react');
var moment = require('moment');
var d3axis = require('d3-axis');
var d3selection = require('d3-selection');
var d3time = require('d3-time');

var component = React.createClass({

    /**
     * @param {d3.scaleTime} timeScale
     */
    _updateAxis: function () {
        var timeScale = this.props.timeScale;
        var axisX = d3axis.axisBottom(timeScale);
        var axisXYears = d3axis.axisBottom(timeScale);
        var smallAxis = d3axis.axisBottom(timeScale);
        axisX.tickArguments([d3time.timeMonth, 1]);
        smallAxis.tickArguments([d3time.timeMonth, 1]);
        axisXYears.tickArguments([d3time.timeYear, 1]);
        axisXYears.tickSize(0);
        axisXYears.tickPadding(35);
        axisX.tickPadding(10);
        axisX.tickSizeInner(5);
        axisX.tickSizeOuter(1);
        smallAxis.tickPadding(10);
        smallAxis.tickSizeInner(5);
        smallAxis.tickSizeOuter(1);
        axisX.tickFormat((value) => {
            return moment(value).format('MMM');
        });
        axisXYears.tickFormat((value) => {
            return moment(value).format('YYYY');
        });
        smallAxis.tickFormat(() => {
            return '';
        });
        axisX(d3selection.select(this.refs.axisX));
        axisXYears(d3selection.select(this.refs.axisXYears));
        smallAxis(d3selection.select(this.refs.smallAxis));
    },

    componentDidMount: function () {
        this._updateAxis();
    },

    componentDidUpdate: function () {
        this._updateAxis();
    },

    render: function () {
        return React.DOM.g(
            null,
            React.DOM.g(
                {
                    transform: `matrix(1 0 0 1 0 ${this.props.irChartHeight})`,
                    ref: 'smallAxis'
                }
            ),
            React.DOM.g(
                {
                    transform: `matrix(1 0 0 1 0 ${this.props.irChartHeight + this.props.tiChartHeight})`
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
        );
    }
});
module.exports = React.createFactory(component);
