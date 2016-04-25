/**
 * @module x-axis
 */
'use strict';

let React = require('react');
let moment = require('moment');
let d3axis = require('d3-axis');
let d3selection = require('d3-selection');
let d3time = require('d3-time');

/**
 * @enum {string}
 */
const axisType = {
    'extended': 'EXTENDED',
    'compact': 'COMPACT'
}

/**
 * @type {axisType, number}
 */
const HEIGHT = {
    'EXTENDED': 50,
    'COMPACT': 10
};

let component = React.createClass({

    /**
     * @param {d3.scaleTime} timeScale
     */
    _updateAxis: function () {
        let timeScale = this.props.timeScale;
        if (this.props.type === axisType.extended) {
            let axisX = d3axis.axisBottom(timeScale);
            let axisXYears = d3axis.axisBottom(timeScale);
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
        } else if (this.props.type === axisType.compact) {
            let smallAxis = d3axis.axisBottom(timeScale);
            smallAxis.tickArguments([d3time.timeMonth, 1]);
            smallAxis.tickPadding(10);
            smallAxis.tickSizeInner(5);
            smallAxis.tickSizeOuter(1);
            smallAxis.tickFormat(() => {
                return '';
            });
            smallAxis(d3selection.select(this.refs.smallAxis));
        } else {
            throw new Error ('incorrect axis type')
        }
    },

    componentDidMount: function () {
        this._updateAxis();
    },

    componentDidUpdate: function () {
        this._updateAxis();
    },

    render: function () {
        return React.DOM.svg(
            {
                width: this.props.timeScale.range()[1],
                height: HEIGHT[this.props.type],
                ref: 'svg'
            },
            React.DOM.g({ref: 'axisX'}),
            React.DOM.g({ref: 'axisXYears'}),
            React.DOM.g({ref: 'smallAxis'})
        );
    }
});
module.exports = React.createFactory(component);

module.exports.HEIGHT = HEIGHT

module.exports.TYPE = axisType
