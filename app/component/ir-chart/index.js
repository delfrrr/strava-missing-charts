/**
 * draws fitness and freshness charts
 * @module component/ir-chart
 */
'use strict';

var React = require('react');
var chroma = require('chroma-js');
var model = require('../../model');
var d3shape = require('d3-shape');
var line = d3shape.line();
var area = d3shape.area();

var component = React.createClass({
    render: function () {
        var transform = `matrix(1 0 0 -1 0 ${this.props.height})`;
        var run = model.get('run');
        var ride = model.get('ride');
        var metrics = this.props.metrics;
        return React.DOM.g(
            null,
            run &&
            React.DOM.path(
                {
                    d: ride ? area(metrics.total) : area(metrics.run),
                    strokeWidth: '0',
                    fill: chroma(this.props.activityColors.run).luminance(0.9).css(),
                    transform
                }
            ),
            ride &&
            React.DOM.path(
                {
                    d: area(metrics.ride),
                    strokeWidth: '0',
                    fill: chroma(this.props.activityColors.ride).luminance(0.8).css(),
                    transform
                }
            ),
            (run || ride) &&
            React.DOM.path(
                {
                    d: (
                        (run && ride && line(metrics.total)) ||
                        (run && line(metrics.run)) ||
                        (ride && line(metrics.ride))
                    ),
                    strokeStyle: 'solid',
                    strokeWidth: '1.5px',
                    stroke: '#000000',
                    fill: 'transparent',
                    transform
                }
            )
        );
    }
});
module.exports = React.createFactory(component);
