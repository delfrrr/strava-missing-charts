/**
 * @module model
 */
'use strict';
var Model = require('backbone-model').Model;
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
     * @typedef {Object} Athlete
     * @see https://strava.github.io/api/v3/athlete/
     */

    /**
     * loads athlete profile
     * @returns {Promise.<Athlete>}
     */
    updateAthlete: function () {
        return this.request('/athlete').then((athlete) => {
            this.set('athlete', athlete);
            return athlete;
        });
    }
}))({
    token: null,
    athlete: null
});
