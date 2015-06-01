Meteor.publish('sensors', function() {
  return Sensors.find();
});

Meteor.publish('measurements', function(sensorId) {
  return Measurements.find({sensorId: sensorId}, {sort: {timeStamp: 1}, limit: 200});
});
