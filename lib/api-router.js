/**
 * Created by yxu on 6/4/2015.
 */
/**
 * return a json string.
 */
var serverResponse = function (response, result) {
    response.setHeader("Content-type", "application/json");
    response.write(JSON.stringify(result, null, 2));
    response.end()
};

Router.map(function () {
    // Restful Server Routes
    this.route('/api/sensors', {where: 'server'})
        .get(function () {
            var result = Sensors.find().fetch();
            serverResponse(this.response, result);
        });

    this.route('/api/sensors/:_id', {where: 'server'})
        .get(function () {
            var result = Sensors.findOne(new Mongo.ObjectID(this.params._id));
            serverResponse(this.response, result);
        });

    /**
     POST to sensors
     example:
     curl -i -H "Content-Type: application/json" -X POST -d '{"name":"my sensor1","location":"my loc1"}' http://localhost:3000/api/sensor
     */
    this.route('/api/sensor', {where: 'server'})
        .post(function () {
            console.log(this.request.body);

            var sensor = {
                name: this.request.body.name,
                location: this.request.body.location,
                measurementCount: 0
            };

            Sensors.insert(sensor);
            serverResponse(this.response, sensor);
        });

    /**
     get measurement by sensorId, query params could be:
         ts : timestamp
      or
         ts_start: starting timestamp
         ts_end: ending timestamp
         limit : number of records return (optional)
     example:
     /api/measurements/556cb2e737c1338f2131d9f8?ts=2015-06-01T19:21:53
     /api/measurements/556cb2e737c1338f2131d9f8?ts_start=2015-06-01&ts_end=2015-06-02&limit=2
     */
    this.route('/api/measurements/:sensorId', {where: 'server'})
        .get(function () {
            //console.log(this.params);
            var sensorId = this.params.sensorId;
            var selector = {sensorId: sensorId};

            var ts = this.params.query.ts;
            if (ts) {
                ts = new Date(ts);
                var result = null;

                // try to find the left bound
                selector.timeStamp = {$lte: ts};
                //console.log(selector);
                var leftBound = Measurements.find(selector, {sort: {timeStamp: -1}, limit: 1}).fetch();
                if (leftBound.length) {
                    // found the left bound
                    if (leftBound[0].timeStamp.valueOf() == ts.valueOf()) {
                        // found exact match, done
                        result = leftBound[0];
                        serverResponse(this.response, result);
                        return;
                    }
                    // store the left bound
                    result = leftBound[0];
                }

                // try to find the right bound
                selector.timeStamp = {$gt: ts};
                var rightBound = Measurements.find(selector, {sort: {timeStamp: 1}, limit: 1}).fetch();
                if (rightBound.length) {
                    // found the right bound
                    if (result) {
                        // has left bound, return the average
                        result.value = (result.value + rightBound[0].value) / 2;
                    } else {
                        // no left bound, return the right
                        result = rightBound[0];
                    }
                }

                if (result) {
                    result._id = "interpolated";
                    result.timeStamp = ts;
                }
                serverResponse(this.response, result);
                return;
            }

            // start and end timestamp, start inclusive
            var ts_start = this.params.query.ts_start;
            var ts_end = this.params.query.ts_end;
            var limit = this.params.query.limit;
            var option = {};
            if (limit) {
                option.limit = parseInt(limit);
            }

            if (ts_start && ts_end) {
                selector.timeStamp = {$gte: new Date(ts_start), $lt: new Date(ts_end)};
                //console.log(selector);
                var result = Measurements.find(selector, option).fetch();
                serverResponse(this.response, result);
            }
        });

    /**
     POST to measurements by sensorId
     example:
     curl -i -H "Content-Type: application/json" -X POST -d '{"value": 100}' http://localhost:3000/api/measurement/556cb2e737c1338f2131d9f8
     */
    this.route('/api/measurement/:sensorId', {where: 'server'})
        .post(function () {
            //console.log(this.request.body);
            //console.log(this.params);

            var sensorId = this.params.sensorId;
            var value = this.request.body.value;

            var measurement = {
                sensorId: sensorId,
                value: value,
                timeStamp: new Date()
            };

            Measurements.insert(measurement);
            Sensors.update(new Mongo.ObjectID(sensorId), {$inc: {measurementCount: 1}});

            serverResponse(this.response, measurement);
        });

})
;