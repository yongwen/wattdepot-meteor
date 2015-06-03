/**
 * Created by yxu on 5/28/2015.
 */

Template.visHourly.helpers({
    myid: function() { return this._id.toHexString();},

    hourlyMeasurementsReady: function() {
        return Router.current().hourlyMeasurementsHandle.ready();
    },
});

Template.visHourly.onRendered(function() {
    Deps.autorun(function () {
        var measurements = HourlyMeasurements.find();
        var data = [{
            key: "Stream",
            values: []
        }];

        measurements.forEach(function (measurement) {
            var value = {
                x: (new Date(2015, 4, measurement.id.day, measurement.id.hour)).valueOf(),
                y: Math.round(measurement.avg)
            };
            //console.log(value);
            data[0].values.push(value);
        });

        if (data[0].values.length != 0)
            showLineWithFocusChart(data);
    });
});

