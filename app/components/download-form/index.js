/**
 * @module components/download-form
 */
'use strict';

var React = require('react');

var component = React.createClass({
    render: function () {
        return React.DOM.div(
            {
                className: 'download-form'
            },
            'download form'
        );
    }
});

module.exports = React.createFactory(component);
