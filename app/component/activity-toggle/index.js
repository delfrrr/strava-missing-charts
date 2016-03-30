/**
 * @module activity-toggle
 */
'use strict';

var React = require('react');
var toggleComponent = React.createFactory(require('material-ui').Toggle);
var model = require('../../model');

var component = React.createClass({
    _onToggle: function (e, toggle) {
        model.set(this.props.modelField, toggle);
    },
    _onModelChange: function () {
        this.setState({
            toggled: model.get(this.props.modelField)
        });
    },
    componentWillMount: function () {
        model.on('change:' + this.props.modelField, this._onModelChange);
        this._onModelChange();
    },
    render: function () {
        return toggleComponent({
            label: this.props.label,
            toggled: this.state.toggled,
            onToggle: this._onToggle
        });
    }
});
module.exports = React.createFactory(component);
