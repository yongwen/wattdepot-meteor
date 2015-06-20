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

Router.route('/vis_meter/:_id', {
    name: 'visMeter',
    waitOn: function () {
        return [Meteor.subscribe('sensors')];
    },
    data: function () {
        return Sensors.findOne(new Mongo.ObjectID(this.params._id));
    },
});

Router.route('/vis_hourly/:_id/:year/:month', {
    name: 'visHourly',
    waitOn: function () {
        return [
            Meteor.subscribe('sensors')];
    },
    data: function () {
            return Sensors.findOne(new Mongo.ObjectID(this.params._id));
    },
});

Router.route('/vis_daily/:_id', {
    name: 'visDaily',
    waitOn: function () {
        return [
            Meteor.subscribe('sensors')];
    },
    data: function () {
            return Sensors.findOne(new Mongo.ObjectID(this.params._id));
    },
});


Router.route('/sensors/:_id', {
    name: 'sensorsShow',
    waitOn: function () {
        this.measurementsHandle = Meteor.subscribe('measurements', this.params._id);
        return [this.measurementsHandle,
            Meteor.subscribe('sensors')];
    },
    data: function () {
        return Sensors.findOne(new Mongo.ObjectID(this.params._id));
    },
});

Router.route('/sensors', {
    name: 'sensors',
    waitOn: function () {
        return [Meteor.subscribe('sensors')];
    },
});

Router.route('/', {
    name: 'home',
    action: function () {
        Router.go('sensors');
    },
});

