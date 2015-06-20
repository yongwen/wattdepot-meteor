Meteor.publish('sensors', function () {
    return Sensors.find();
});

Meteor.publish('measurements', function (sensorId) {
    return Measurements.find({sensorId: sensorId},{limit: 100});
});

Meteor.methods({
    "get_h_measurements": getHourlyMeasurements
});

Meteor.methods({
    'get_d_measurements': getDailyMeasurements
});
