Router.configure({
    // we use the  appBody template to define the layout for the entire app
    layoutTemplate: 'appBody',

    // the appNotFound template is used for unknown routes and missing lists
    notFoundTemplate: 'appNotFound',

    // show the appLoading template whilst the subscriptions below load their data
    loadingTemplate: 'appLoading',

    // wait on the following subscriptions before rendering the page to ensure
    // the data it's expecting is present
    waitOn: function() {
        return [
            Meteor.subscribe('sensors'),
        ];
    },
});

dataReadyHold = null;

if (Meteor.isClient) {
    // Keep showing the launch screen on mobile devices until we have loaded
    // the app's data
    dataReadyHold = LaunchScreen.hold();

    // Show the loading screen on desktop
    Router.onBeforeAction('loading', {except: ['join', 'signin']});
    Router.onBeforeAction('dataNotFound', {except: ['join', 'signin']});
}

Router.route('/join');
Router.route('/signin');

Router.route('/vis/:_id', {
    name: 'visualization',
    waitOn: function () {
        return [Meteor.subscribe('measurements', this.params._id),
            Meteor.subscribe('sensors')];
    },
    data: function () {
        return Sensors.findOne(new Mongo.ObjectID(this.params._id));
    },
});

Router.route('/vis_hourly/:_id/:year/:month', {
    name: 'visHourly',
    data: function () {
            return Sensors.findOne(new Mongo.ObjectID(this.params._id));
    },
});

Router.route('/vis_daily/:_id', {
    name: 'visDaily',
    data: function () {
            return Sensors.findOne(new Mongo.ObjectID(this.params._id));
    },
});


Router.route('/sensors/:_id', {
    name: 'sensorsShow',
    waitOn: function () {
        return this.measurementsHandle = Meteor.subscribe('measurements', this.params._id);
    },
    data: function () {
        return Sensors.findOne(new Mongo.ObjectID(this.params._id));
    },
});

Router.route('/', {
    name: 'home',
    action: function () {
        Router.go('sensorsShow', {_id: Sensors.findOne()._id.toHexString()});
    },
});

Router.map(function() {
    // Restful Server Routes
    this.route('/api/sensors', {where: 'server'})
        .get(function () {
            var result;
            result = Sensors.find().fetch();

            this.response.setHeader("Content-type", "application/json");
            this.response.write(JSON.stringify(result, null, 2));
            this.response.end()
        });

    this.route('/api/sensors/:_id', {where: 'server'})
        .get(function () {
            var result;
            result = Sensors.findOne(new Mongo.ObjectID(this.params._id));

            this.response.setHeader("Content-type", "application/json");
            this.response.write(JSON.stringify(result, null, 2));
            this.response.end()
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

            this.response.setHeader("Content-type", "application/json");
            this.response.write(JSON.stringify(sensor, null, 2));
            this.response.end();
        });

    /**
     get measurement by sensorId, query params could be:
     ts : timestamp
     ts_start: starting timestamp
     ts_end: ending timestamp
     limit : number of records return
     example:
     /api/measurements/556cb2e737c1338f2131d9f8?ts=2015-06-01T19:21:53&limit=10
     /api/measurements/556cb2e737c1338f2131d9f8?ts_start=2015-06-01&ts_end=2015-06-02&limit=2
     */
    this.route('/api/measurements/:sensorId', {where: 'server'})
        .get(function () {

            //console.log(this.params);

            var sensorId = this.params.sensorId;
            var selector = {sensorId: sensorId};

            var limit = this.params.query.limit;
            if (limit) {
                limit = parseInt(limit);
            } else {
                limit = 10;
            }

            // get one timestamp within a second
            var ts = this.params.query.ts;
            if (ts) {
                gte_ts = new Date(ts);
                lt_ts = new Date(gte_ts.valueOf() + 1000);
                selector.$and = [{timeStamp: {$lt: lt_ts}}, {timeStamp: {$gte: gte_ts}}];
            }

            // start and end timestamp, inclusive
            var ts_start = this.params.query.ts_start;
            var ts_end = this.params.query.ts_end;
            if (ts_start && ts_end) {
                selector.$and = [{timeStamp: {$lte: new Date(ts_end)}}, {timeStamp: {$gte: new Date(ts_start)}}];
            }

            //console.log(selector);
            var result;
            result = Measurements.find(selector, {limit: limit}).fetch();
            this.response.setHeader("Content-type", "application/json");
            this.response.write(JSON.stringify(result, null, 2));
            this.response.end()
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

            this.response.setHeader("Content-type", "application/json");
            this.response.write(JSON.stringify(measurement, null, 2));
            this.response.end();
        });

});
