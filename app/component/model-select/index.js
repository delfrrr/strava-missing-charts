/**
 * @module model-select
 */
'use strict';

var React = require('react');
var selectComponent = React.createFactory(require('material-ui').SelectField);
var menuItemComponent = React.createFactory(require('material-ui').MenuItem);
var model = require('../../model');
var _  = require('lodash');

var component = React.createClass({
    _onChange: function (e, key, value) {
        model.set(this.props.modelField, value);
    },
    _onModelChange: function () {
        this.setState({
            value: model.get(this.props.modelField)
        });
    },
    componentWillMount: function () {
        model.on('change:' + this.props.modelField, this._onModelChange);
        this._onModelChange();
    },
    render: function () {
        return selectComponent({
            value: this.state.value,
            fullWidth: true,
            onChange: this._onChange
        }, this.props.options.map((option, key) => {
            return menuItemComponent(_.assign(
                {},
                option,
                {
                    key
                }
            ));
        }));
    }
});
module.exports = React.createFactory(component);
