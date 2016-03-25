/**
 * @module components/route
 */
'use strict';
var React = require('react');
var classnames = require('classnames');
require('./route.less');
var component = React.createClass({
    render: function () {
        var route = this.props.route;
        // console.log(route);
        return React.DOM.div(
            {
                className: classnames(
                    'route',
                    this.props.className
                )
            },
            React.DOM.div(
                {
                    className: 'route__name'
                },
                route.name
            ),
            React.DOM.div(
                {
                    className: 'route__distance'
                },
                route.distance
            ),
            React.DOM.div(
                {
                    className: 'route__date'
                },
                route.timestamp
            )
        );
    }
});

module.exports = React.createFactory(component);
