/**
 * riding perfomance chart
 * @module component/ir-chart
 */
'use strict';

var React = require('react');
var d3scale = require('d3-scale');
var d3shape = require('d3-shape');
var line = d3shape.line();

/**
 * @param {Array.<{activities: Activity[], segments:Segment[]}>} rideRoutes
 * @param {number} height of chart
 * @param {d3.scale} timeScale
 * @param {Array.<{Array.<{Number[]}>}>} data for lines
 */
function getPoints(rideRoutes, height, timeScale) {
    var speedData = rideRoutes.map((route) => {
        var {activities, segments} = route;
        return activities.map((activity) => {
            var time = 0;
            var distance = 0;
            var speed;
            var x = timeScale(Date.parse(activity.start_date));
            activity.segment_efforts.forEach((effort) => {
                if (segments.indexOf(effort.segment.id) >= 0) {
                    time += effort.moving_time;
                    distance += effort.distance;
                }
            });
            speed = distance / time * 3.6;
            return [x, speed];
        });
    });
    var speedAr = [].concat(...speedData.map((routeAr) => {
        return routeAr.map((xyAr) => {
            return xyAr[1];
        });
    }));
    var scaleY = d3scale.scaleLinear().range([0, height])
        .domain([
            Math.min(...speedAr),
            Math.max(...speedAr)
        ]);
    return speedData.map((routeAr) => {
        return routeAr.map((xyAr) => {
            return [xyAr[0], scaleY(xyAr[1])];
        });
    });
}

var component = React.createClass({
    render: function () {
        var linesData = getPoints(
            this.props.rideRoutes,
            this.props.height,
            this.props.timeScale
        );
        return React.DOM.g(
            {
                transform: `matrix(1 0 0 -1 0 ${this.props.height})`
            },
            linesData.map((lineData, key) => {
                return React.DOM.path(
                    {
                        d: line(lineData),
                        key,
                        strokeStyle: 'solid',
                        strokeWidth: '1.5px',
                        stroke: '#000000',
                        fill: 'transparent'
                    }
                )
            })
        )
    }
});
module.exports = React.createFactory(component);
