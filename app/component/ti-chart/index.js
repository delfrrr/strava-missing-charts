/**
 * draws training impulse bars
 * @module component/ti-chart
 */
'use strict';

var React = require('react');
var _ = require('lodash');
var model = require('./../../model');
var d3scale = require('d3-scale');
var TOP_PADDING = 10;

/**
 * @param {Object.<string, TrainingImpulse[]>} trainingImpulses
 * @param {function>} timeScale - d3 scale
 * @param {function>} valueScale - d3 scale
 * @param {Object.<string, string>} activityColors - colors by activity type
 * @returns {React.Component[]} bars
 */
function getBars(trainingImpulses, timeScale, valueScale, activityColors) {
    var bars = [];
    _.forEach(activityColors, function (color, type) {
        if (!model.get(type)) {
            return;
        }
        var impulses = trainingImpulses[type];
        impulses.forEach(function (trainingImpulse) {
            bars.push(React.DOM.line({
                key: bars.length,
                x1: Math.floor(timeScale(trainingImpulse[0])),
                y1: 0,
                x2: Math.floor(timeScale(trainingImpulse[0])),
                y2: Math.floor(valueScale(trainingImpulse[1])),
                stroke: activityColors[type],
                strokeWidth: 2
            }));
        })
    });
    return bars;
}

var component = React.createClass({
    render: function () {
        var maxImpulse = Math.max.apply(
            Math,
            this.props.trainingImpulses.total.map((trainingImpulse) => {
                return trainingImpulse[1];
            })
        );
        var valueScale = d3scale.scaleLinear()
            .domain([0, maxImpulse])
            .range([0, this.props.height - TOP_PADDING]);
        var transform = `matrix(1 0 0 -1 0 ${this.props.height})`;
        return React.DOM.svg(
            {
                width: this.props.timeScale.range()[1],
                height: this.props.height
            },
            React.DOM.g(
                {
                    transform
                },
                getBars(
                    this.props.trainingImpulses,
                    this.props.timeScale,
                    valueScale,
                    this.props.activityColors
                )
            )
        );
    }
});
module.exports = React.createFactory(component);
