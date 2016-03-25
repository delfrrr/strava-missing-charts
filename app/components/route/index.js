/**
 * @module components/route
 */
'use strict';
var React = require('react');

var component = React.createClass({
    render: function () {
        var route = this.props.route;
        // console.log(route);
        return React.DOM.div(
            {},
            route.name
        );
    }
});

module.exports = React.createFactory(component);
