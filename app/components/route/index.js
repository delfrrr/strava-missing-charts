/**
 * @module components/route
 */
'use strict';
var React = require('react');
var classnames = require('classnames');
var moment = require('moment');
var downloadFormComponent = require('../download-form');
require('./route.less');
var component = React.createClass({
    getInitialState: function () {
        return {
            downloadForm: false
        }
    },
    _onClick: function () {
        if (!this.state.downloadForm) {
            this.setState({
                downloadForm: true
            });
        }
    },
    render: function () {
        var route = this.props.route;
        // console.log(route);
        return React.DOM.div(
            {
                className: classnames(
                    'route',
                    this.props.className,
                    {
                        'route_download': this.state.downloadForm
                    }
                ),
                onClick: this._onClick
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
                `${(route.distance / 1000).toFixed(1)}km`
            ),
            React.DOM.div(
                {
                    className: 'route__date'
                },
                moment(route.timestamp * 1000).format('LL')
            ),
            this.state.downloadForm && downloadFormComponent(
                {
                    route: route
                }
            )
        );
    }
});

module.exports = React.createFactory(component);
