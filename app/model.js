/**
 * @module model
 */
'use strict';
var Model = require('backbone-model').Model;
var Promise = require('bluebird');
var jsonp = Promise.promisify(require('jsonp'));
var _  = require('lodash');
const API_URL = 'https://www.strava.com/api/v3';
const DOM_STORAGE_KEY = 'model_storage';
const IMPULSE_TYPE = {
    sufferScore: 'SUFFER_SCORE',
    heartRate: 'HEART_RATE'
};
var url = require('url');

//load model data
var storedData = window.localStorage.getItem(DOM_STORAGE_KEY);
if (storedData) {
    try {
        storedData = JSON.parse(storedData);
    } catch (e) {
        setTimeout(() => {
            throw e;
        });
        storedData = null;
    }
}
storedData = storedData || {};

var model = new (Model.extend({

    /**
     * @enum {number}
     */
    IMPULSE_TYPE: IMPULSE_TYPE,

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
    },

    /**
     * @typedef {Object} Activity
     * @see https://strava.github.io/api/v3/activities/
     */

    /**
     * @typedef {Object.<Activity.id, Activity>} Activities
     * @see https://strava.github.io/api/v3/activities/
     */

    /**
     * loads athlete activities
     * @return {Promises.<Activities>}
     */
    loadActivities: function () {
        return this.request('/athlete/activities', {
            per_page: 200
        }).then((activitiesAr) => {
            var knownActivities = this.get('activities') || {};
            var newActivities = activitiesAr.reduce((activities, activity) => {
                activities[activity.id] = activity;
                return activities;
            }, knownActivities);
            this.set('activities', newActivities);
            return newActivities;
        });
    }
}))(_.defaults(
    storedData,
    {
        token: null,
        athlete: null,
        activities: null,
        run: true,
        ride: true,
        impulseType: IMPULSE_TYPE.sufferScore,
        //TODO: add to form
        restHR: 60,
        maxHR: 207// it's important only when compare athlets
    }
));

//save model
model.on('change', _.debounce(() => {
    window.localStorage.setItem(DOM_STORAGE_KEY, JSON.stringify(model.toJSON()));
}), 100);

module.exports = model;
