/**
 * @module components/routes
 */
'use strict';

var React = require('react');
var model = require('../../model');
var routeComponent = require('./../route');
var classnames = require('classnames');
require('./routes.less');
var component = React.createClass({
    getInitialState: function () {
        return {
            routes: null
        };
    },
    componentDidMount: function () {
        model.getRoutes().then((res) => {
            this.setState({
                routes: res
            });
        }).done();
    },
    render: function () {
        return React.DOM.div(
            {
                className: classnames(
                    'routes',
                    this.props.className
                )
            },
            this.state.routes ?
            this.state.routes.map((route, key) => {
                return routeComponent({route, key});
            }) :
            React.DOM.div(
                {
                    className: 'routes__loading'
                },
                'Loading routes...'
            )
        );
    }
});
module.exports = React.createFactory(component);
