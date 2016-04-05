/**
 * @module model
 */
'use strict';
var Model = require('backbone-model').Model;
var Promise = require('bluebird');
var jsonp = Promise.promisify(require('jsonp'));
const API_URL = 'https://www.strava.com/api/v3';
const DOM_STORAGE_KEY = 'model_storage';
const IMPULSE_TYPE = {
    sufferScore: 'SUFFER_SCORE',
    heartRate: 'HEART_RATE'
};
const METRIC_TYPE = {
    fitness: 'FITNESS',
    form: 'FORM'
};
var url = require('url');


var model = new (Model.extend({

    /**
     * @enum {string}
     */
    IMPULSE_TYPE: IMPULSE_TYPE,

    /**
     * @enum {string}
     */
    METRIC_TYPE: METRIC_TYPE,

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
     * @param {Activity} activity
     * @returns {number} impulse value
     */
    _getImpulse: function (activity) {
        switch (this.get('impulseType')) {
            case IMPULSE_TYPE.sufferScore:
                return Number(activity.suffer_score)
            case IMPULSE_TYPE.heartRate:
                return (
                    (activity.average_heartrate - this.get('restHR')) /
                    (this.get('maxHR') - this.get('restHR'))
                ) * activity.moving_time
        }
    },

    /**
     * calculates training impulses for current activities
     */
    updateTrainingImpulses: function () {
        var trainingImpulses = {
            run: [],
            ride: [],
            total: []
        };
        var activities = this.get('activities');
        Object.keys(this.get('activities')).forEach((id) => {
            var activity = activities[id];
            var ts = Date.parse(activity.start_date);
            var impulse = this._getImpulse(activity);
            if (impulse) {
                var item = [ts, impulse, id];
                trainingImpulses.total.push(item);
                if (activity.type === 'Run') {
                    trainingImpulses.run.push(item);
                } else if (activity.type === 'Ride') {
                    trainingImpulses.ride.push(item);
                }
            }
        });
        this.set('trainingImpulses', trainingImpulses);
    },

    updateFullRideActivities: function () {
        var activities = this.get('activities');
        var rideActivities = this.get('trainingImpulses').ride.map(
            (impulseAr) => {
                return activities[impulseAr[2]];
            }
        );
        return Promise.all(rideActivities.map((activity) => {
            return this.request(`/activities/${activity.id}`, {
                include_all_efforts: true
            });
        })).then(function (fullRideActivities) {
            this.set('fullRideActivities', fullRideActivities);
        });
    },

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
    },

    fetch: function () {
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
        model.set(storedData);
    },

    save: function () {
        var jsonToSave = model.toJSON();
        window.localStorage.setItem(DOM_STORAGE_KEY, JSON.stringify(jsonToSave));
    }

}))({
    token: null,
    athlete: null,
    activities: null,
    fullRideActivities: null,
    run: true,
    ride: true,
    impulseType: IMPULSE_TYPE.sufferScore,
    trainingImpulses: null,
    metric: METRIC_TYPE.fitness,
    restHR: 60,
    maxHR: 207// it's important only when compare athlets
});


module.exports = model;
