Meteor.publish('sensors', function () {
    return Sensors.find();
});

Meteor.publish('measurements', function (sensorId) {
    return Measurements.find({sensorId: sensorId}, {sort: {timeStamp: -1}, limit: 50});
});

Meteor.methods({
    "get_h_measurements": function (sensorId, year, month) {
        var year = parseInt(year);
        var month = parseInt(month) - 1;
        var pipeline = [
            {
                $match: {
                    sensorId: sensorId,
                    timeStamp: {$gte: new Date(year, month, 1), $lt: new Date(year, month, 5)},
                }
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
                    "_id.day": -1,
                    "_id.hour": -1,
                }
            },
        ];


        console.log(JSON.stringify(pipeline));
        var results = Measurements.aggregate(pipeline);
        return results;
    }
});

Meteor.methods({
    'get_d_measurements': function (sensorId) {
        var pipeline = [
            {
                $match: {
                    sensorId: sensorId,
                    timeStamp: {$gte: new Date(2015, 4, 1), $lt: new Date(2015, 5, 1)},
                }
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
                    "_id.year": -1,
                    "_id.month": -1,
                    "_id.day": -1,
                }
            }
        ];

        console.log(JSON.stringify(pipeline));
        var results = Measurements.aggregate(pipeline);
        return results;
    }
});
