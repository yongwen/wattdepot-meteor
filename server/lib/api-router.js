/**
 * Created by yxu on 6/4/2015.
 */
/**
 * return a json string.
 */
var serverResponse = function (response, result) {
    response.setHeader("Content-type", "application/json");
    response.write(JSON.stringify(result, null, 2));
    response.end();
};

Router.map(function () {
    // Restful Server Routes
    this.route('/api/sensors', {where: 'server'})
        .get(function () {
            var result = Sensors.find().fetch();
            serverResponse(this.response, result);
        });

    this.route('/api/sensor/:_id', {where: 'server'})
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

            var _id = Sensors.insert(sensor);
            serverResponse(this.response, _id);
        });

    /**
     get measurement by sensorId, query params could be: (in this priority)
     latest:
     or
     ts : timestamp
     or
     ts_start: starting timestamp
     ts_end: ending timestamp
     step: year, month, day, hour, minute, second
     limit : number of records return (optional)

     example:
     /api/measurements/556a1315f69322ec182114dc?latest
     /api/measurements/556a1315f69322ec182114dc?ts=2015-06-01T19:21:53
     /api/measurements/556a1315f69322ec182114dc?ts_start=2015-06-01&ts_end=2015-06-02&limit=2
     /api/measurements/556a1315f69322ec182114dc?ts_start=2015-01-01&limit=100&step=1month
     */
    this.route('/api/measurements/:sensorId', {where: 'server'})
        .get(function () {
            console.log(this.params);
            var result = null;
            var query = this.params.query;


            if (query.latest) { // latest param has the first priority
                result = getLatestValue(this.params.sensorId);
            } else if (query.ts) { // ts param has the second priority
                result = getTimeStampValue(query.ts, this.params.sensorId);
            } else if (query.ts_start || query.ts_end) { // start and end timestamp,
                result = getStartEndTimeStampValue(query, this.params.sensorId);
            } else {
                result = [];
            }

            this.response.setHeader('access-control-allow-origin', '*');
            serverResponse(this.response, result);
        });

    /**
     POST to measurements by sensorId
     example:
     curl -i -H "Content-Type: application/json" -X POST -d '{"value": 100}' http://localhost:3000/api/measurement/556cb2e737c1338f2131d9f8
     curl -i -H "Content-Type: application/json" -X POST -d '{"value": 100, "timeStamp": "2015-05-01"}' http://localhost:3000/api/measurement/556cb2e737c1338f2131d9f8
     */
    this.route('/api/measurement/:sensorId', {where: 'server'})
        .post(function () {
            //console.log(this.request.body);
            //console.log(this.params);

            var sensorId = this.params.sensorId;
            var value = this.request.body.value;

            var timeStamp = this.request.body.timeStamp;
            if (timeStamp) { timeStamp = new Date(timeStamp); }
            else { timeStamp = new Date(); }

            var measurement = {
                sensorId: sensorId,
                value: value,
                timeStamp: timeStamp,
            };

            Measurements.insert(measurement);
            Sensors.update(new Mongo.ObjectID(sensorId), {$inc: {measurementCount: 1}});

            serverResponse(this.response, measurement);
        });
});