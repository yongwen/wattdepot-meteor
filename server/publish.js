Meteor.publish('sensors', function() {
  return Sensors.find();
});

Meteor.publish('measurements', function(sensorId) {
  return Measurements.find({sensorId: sensorId}, {sort: {timeStamp: -1}, limit: 50});
});

Meteor.publish('h_measurements', function(sensorId) {
  var self = this;
  var pipeline = [
    {
      $match: {
        sensorId: sensorId,
        timeStamp: {$gte: new Date(2015, 4, 1), $lt: new Date(2015, 5, 1)},
      }
    },
    { $project: { timeStamp: {$subtract: ["$timeStamp", 36000000]},
      value: 1}
    },
    {
      $group: {
        _id: {
          day: {$dayOfMonth: "$timeStamp"},
          hour: {$hour: "$timeStamp"},
        },
        avg: {$avg: "$value"},
      }
    },
    {
      $sort: {
        "_id.day": 1,
        "_id.hour": 1,
      }
    },
  ];

  console.log(pipeline);
  var results = Measurements.aggregate(pipeline);
  for (var i=0 ;i<results.length; i++) {
    console.log(results[i]._id);
    self.added("h_measurements", ""+results[i]._id.day+" "+results[i]._id.hour, {id: results[i]._id, avg: results[i].avg});
  };
  self.ready();
});

Meteor.publish('d_measurements', function(sensorId) {
  var self = this;
  var pipeline = [
    {
      $match: {
        sensorId: sensorId,
      }
    },
    { $project: { timeStamp: {$subtract: ["$timeStamp", 36000000]},
      value: 1}
    },
    {
      $group: {
        _id: {
          year: {$year: "$timeStamp"},
          month: {$month: "$timeStamp"},
          day: {$dayOfMonth: "$timeStamp"},
        },
        avg: {$avg: "$value"},
      }
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
        "_id.day": 1,
      }
    }
  ];

  console.log(pipeline);
  var results = Measurements.aggregate(pipeline);
  for (var i=0 ;i<results.length; i++) {
    console.log(results[i]._id);
    self.added("d_measurements", ""+results[i]._id.month+" "+results[i]._id.day, {id: results[i]._id, avg: results[i].avg});
  };
  self.ready();
});
