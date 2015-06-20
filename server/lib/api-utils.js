getLatestValue = function (sensorId) {
    var selector = {sensorId: sensorId};
    return Measurements.findOne(selector, {sort: {timeStamp: -1}});
};

getTimeStampValue = function (ts, sensorId) {
    var result = null;
    var selector = {sensorId: sensorId};

    ts = new Date(ts);

    // try to find the left bound
    selector.timeStamp = {$lte: ts};
    //console.log(selector);
    var leftBound = Measurements.findOne(selector, {sort: {timeStamp: -1}});
    if (leftBound) {
        // found the left bound
        if (leftBound.timeStamp.valueOf() == ts.valueOf()) {
            // found exact match, done
            return leftBound;
        }
        // store the left bound
        result = leftBound;
    }

    // try to find the right bound
    selector.timeStamp = {$gt: ts};
    var rightBound = Measurements.findOne(selector, {sort: {timeStamp: 1}});
    if (rightBound) {
        // found the right bound
        if (result) {
            // has left bound, return the average
            result.value = (result.value + rightBound.value) / 2;
        } else {
            // no left bound, return the right
            result = rightBound;
        }
    }

    if (result) {
        result._id = "interpolated";
        result.timeStamp = ts;
    }

    return result;
};

var getAggregationGroupId = function (step) {
    var _id = {};
    var pos, stepType, stepValue;
    if ((pos = step.indexOf('second')) != -1) stepType = 'second';
    else if ((pos = step.indexOf('minute')) != -1) stepType = 'minute';
    else if ((pos = step.indexOf('hour')) != -1) stepType = 'hour';
    else if ((pos = step.indexOf('day')) != -1) stepType = 'day';
    else if ((pos = step.indexOf('month')) != -1) stepType = 'month';
    else if ((pos = step.indexOf('year')) != -1) stepType = 'year';
    else return null;

    stepValue = parseInt(step.slice(0,pos));

    if (stepType != 'year') _id.year = {$year: {$add:["$timeStamp", -10*3600*1000]}};
    else {
        _id.year = {$subtract: [
            {$year: "$timeStamp"},
            {$mod: [{$year: "$timeStamp"}, stepValue]}]};
        return _id;
    }

    if (stepType != 'month') _id.month = {$month: {$add:["$timeStamp", -10*3600*1000]}};
    else {
        _id.month = {
            $subtract: [
                {$month: "$timeStamp"},
                {$mod: [{$month: "$timeStamp"}, stepValue]}]
        };
        return _id;
    }

    if (stepType != 'day') _id.day = {$dayOfMonth: {$add:["$timeStamp", -10*3600*1000]}};
    else {
        _id.day = {$subtract: [
            {$dayOfMonth: "$timeStamp"},
            {$mod: [{$dayOfMonth: "$timeStamp"}, stepValue]}]};
        return _id;
    }

    if (stepType != 'hour') _id.hour = {$hour: {$add:["$timeStamp", -10*3600*1000]}};
    else {
        _id.hour = {$hour: {$add:["$timeStamp", -10*3600*1000]}};
/*
        _id.hour = {$subtract: [
            {$hour: "$timeStamp"},
            {$mod: [{$hour: "$timeStamp"}, stepValue]}]};
*/
        return _id;
    }

    if (stepType != 'minute') _id.minute = {$minute: "$timeStamp"};
    else {
        _id.minute = {$subtract: [
            {$minute: "$timeStamp"},
            {$mod: [{$minute: "$timeStamp"}, stepValue]}]};
        return _id;
    }

    _id.second = {$subtract: [
        {$second: "$timeStamp"},
        {$mod: [{$second: "$timeStamp"}, stepValue]}]};

    return _id;
};

convertToUTC = function (date) {
    if (date.getTimezoneOffset() != 0) {
        var offset = (new Date().getTimezoneOffset()) * 60 * 1000;
        return new Date(date.getTime() + offset);
    }
    return date;
}

getStartEndTimeStampValue = function(query, sensorId) {
    var step = query.step;
    var option = {};
    var limit = query.limit;
    if (limit)
        option.limit = parseInt(limit);

    // fix the bound
    var ts_start = query.ts_start, ts_end = query.ts_end;
    if (ts_start) ts_start = new Date(ts_start);
    if (ts_end) ts_end = new Date(ts_end);
    if (!ts_end) ts_end = new Date();
    if (!ts_start) ts_start = new Date();

    // handle timezone offset
    ts_start = convertToUTC(ts_start);
    ts_end = convertToUTC(ts_end);

    var selector = {sensorId: sensorId};

    //start inclusive, end exclusive
    selector.timeStamp = {$gte: ts_start, $lt: ts_end};

    if (!step) {
        // return the whole range without step sample
        return Measurements.find(selector, option).fetch();
    } else {
        // if step, aggregate by sample step, supported steps are:
        // second
        // minute
        // hour
        // day
        // month
        // year
        var _id = getAggregationGroupId(step);
        if (!_id)
            return [];   // invalid type

        var group = {
            _id: _id,
            avg: { $avg: "$value" },
            sum: { $sum: "$value" },
            count: {$sum: 1}};
        var pipeline = [
            {$match: selector},
            {$group: group},

            {$sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                    "_id.day": 1,
                    "_id.hour": 1,
                    "_id.minute": 1,
                    "_id.second": 1,
                }},
            {$limit: option.limit},
        ];
        console.log(JSON.stringify(pipeline, null, 2));
        return Measurements.aggregate(pipeline);
    }
};

getHourlyMeasurements = function (sensorId, year, month) {
    var year = parseInt(year);
    var month = parseInt(month) - 1;
    var pipeline = [
        {
            $match: {
                sensorId: sensorId,
                timeStamp: {$gte: new Date(year, month, 1), $lt: new Date(year, month+1, 1)},
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
};

getDailyMeasurements = function (sensorId) {
    var pipeline = [
        {
            $match: {
                sensorId: sensorId,
                //timeStamp: {$gte: new Date(2015, 4, 1), $lt: new Date(2015, 5, 1)},
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
};