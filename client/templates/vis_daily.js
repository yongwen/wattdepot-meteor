/**
 * Created by yxu on 5/28/2015.
 */

Template.visDaily.helpers({
    myid: function() { return this._id.toHexString();},

    dailyMeasurementsReady: function() {
        return Router.current().dailyMeasurementsHandle.ready();
    },
});

Template.visDaily.onRendered(function() {
    Deps.autorun(function () {
        var measurements = DailyMeasurements.find();
        var data = [{
            key: "Stream",
            values: []
        }];

        measurements.forEach(function (measurement) {
            var value = {
                x: (new Date(measurement.id.year, measurement.id.month-1, measurement.id.day)).valueOf(),
                y: Math.round(measurement.avg)
            };
            //console.log(value);
            data[0].values.push(value);
        });

        if (data[0].values.length != 0)
            showLineWithFocusChart(data);
    });
});

