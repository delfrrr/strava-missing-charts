/**
 * @module components/routes
 */
'use strict';

var React = require('react');
var model = require('../../model');
var routeComponent = require('./../route');
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
        if (!this.state.routes) {
            return null;
        }
        return React.DOM.div(
            null,
            this.state.routes.map((route, key) => {
                return routeComponent({route, key});
            })
        );
    }
});
module.exports = React.createFactory(component);
