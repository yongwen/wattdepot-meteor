// if the database is empty on server start, create some sample data.
Meteor.startup(function () {
  if (Sensors.find().count() === 0) {
    var data = [
      {name: "Energy Sensor A",
       location: "21.29, 157.86",
       measurementCount: 0
      },
      {name: "Energy Sensor B",
       location: "21.29, 157.86",
       measurementCount: 0
      }
    ];

    _.each(data, function(sensor) {
      var sensor_id = Sensors.insert({
        name: sensor.name,
        location: sensor.location,
        measurementCount: sensor.measurementCount
      });
    });
  }
});
