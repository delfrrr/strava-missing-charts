/**
 * @module calculate-perfomace
 */
'use strict';

var _  = require('lodash');

/**
 * @param {Effort} effort
 * @returns {number} id
 */
function effortSegmentId(effort) {
    return effort.segment.id;
}

module.exports = function () {
    var model = this;
    /**
     * @type {Activity[]}
     */
    var activities = model.get('fullRideActivities');

    /**
     * @type {Object.<Segment.id, Stats>}
     */
    var segmentStats = {};

    /**
     * @type {Object.<Activity.id, Activity>}
     */
    var activitiesById = {};

    /**
     * @type {Object.<Activity.id, Effort[]>}
     */
    var effortsByActivity = {};

    /**
     * @type {Activity[][]}
     */
    var groups = [];


    /**
     * @param {Activity} activity
     * @returns {Number[]} segment ids
     */
    function activitySegments(activity) {
        return effortsByActivity[activity.id].map(effortSegmentId);
    }

    activities.forEach((activity) => {
        activitiesById[activity.id] = activity;
        activity.segment_efforts.forEach((effort) => {
            segmentStats[effort.segment.id] = segmentStats[effort.segment.id] ||
                {
                    count: 0,
                    nonStopCount: 0,
                    starred: effort.segment.starred
                };
            segmentStats[effort.segment.id].count++;
            if (effort.elapsed_time === effort.moving_time) {
                segmentStats[effort.segment.id].nonStopCount++;
            }
        });
    });

    activities.forEach((activity) => {
        var efforts = [];
        activity.segment_efforts.forEach((effort) => {
            var segmentStat = segmentStats[effort.segment.id];
            if (
                segmentStat.nonStopCount === 0 ||
                segmentStat.count < 2
            ) {
                return;
            }
            var prevEffort = efforts[efforts.length - 1];
            var prevSegmentStat = prevEffort && segmentStats[prevEffort.segment.id];
            if (
                prevEffort &&
                prevEffort.end_index > effort.start_index
            ) {
                if (
                    segmentStat.starred ||
                    segmentStat.nonStopCount > prevSegmentStat.nonStopCount
                ) {
                    //replace prev segment with next one
                    efforts[efforts.length - 1] = effort;
                }
            } else {
                efforts.push(effort)
            }
        });
        if (efforts.length) {
            effortsByActivity[activity.id] = efforts;
        }
    });

    activities.filter((activity) => {
        return effortsByActivity[activity.id]
    }).forEach(function (activity) {
        var segments = activitySegments(activity);
        var bestGroup = null;
        var bestGroupScore = 0;
        groups.forEach(function (group) {
            var groupActivitySegments = group.map(activitySegments);
            var groupSegments = _.intersection(...groupActivitySegments);
            var newGroupSegments = _.intersection(segments, ...groupActivitySegments);
            if (
                newGroupSegments.length > 0.5 * segments.length &&
                newGroupSegments.length > 0.5 * groupSegments.length &&
                newGroupSegments.length > bestGroupScore
            ) {
                bestGroup = group;
                bestGroupScore = newGroupSegments.length
            }
        });
        if (bestGroupScore) {
            bestGroup.push(activity);
        } else {
            groups.push([activity]);
        }
    });

    model.set('rideRoutes', groups.map((group) => {
        return {
            activities: group,
            segments: _.intersection(...group.map(activitySegments))
        }
    }));
};
