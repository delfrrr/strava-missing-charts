/**
 * @module model
 */
'use strict';
var Model = require('backbone-model').Model;
var cookies = require('cookies-js');
var Promise = require('bluebird');
var jsonp = Promise.promisify(require('jsonp'));
const API_URL = 'https://www.strava.com/api/v3';
var url = require('url');
module.exports = new (Model.extend({
    /**
     * request strava api
     * @param {string} endpoint
     * @param {object} [params]
     * @return {Promise.<Object>} result
     */
    request: function (endpoint, params = {}) {
        var urlObj = url.parse(API_URL);
        urlObj.pathname += endpoint;
        urlObj.query = Object.assign({
            access_token: this.get('token')
        }, params);
        var requestUrl = url.format(urlObj);
        return jsonp(requestUrl);
    },

    /**
     * @see https://strava.github.io/api/v3/routes/#list
     * @return {Promise.<Array>}
     */
    getRoutes: function () {
        return this.request('/athlete').then((res) => {
            return this.request(`/athletes/${res.id}/routes`);
        });
    }
}))({
    token: cookies.get('token')
});
