/**
 * Created by yxu on 5/28/2015.
 */

var showGoogleMeter = function () {
    var sensorId = Router.current().params._id;
    var url = "/api/measurements/" + sensorId + "?latest";
    var refreshInterval = 5;  // 5 second refresh
    meter_timer = setInterval(function () {
        jQuery.get(url, function (result) {
            var data = {};
            data.value = +result.value;
            data.min = 1;
            data.max = 200;

            drawGoogleMeter("meterContainer", data);
        });
    }, refreshInterval * 1000);
}

var showGoogleGauge = function () {
    $(document).ready(function () {
        var sensorId = Router.current().params._id;
        var url = "/api/measurements/" + sensorId + "?latest";
        var refreshInterval = 5;  // 5 second refresh
        gauge_timer = setInterval(function () {
            jQuery.get(url, function (result) {
                var data = {};
                data.value = +result.value;
                data.min = 1;
                data.max = 200;

                drawGoogleGauge("gaugeContainer", data);
            });
        }, refreshInterval * 1000);
    });
};

var showGoogleHotSpot = function () {
    $(document).ready(function () {
        var sensorId = Router.current().params._id;
        var url = "/api/measurements/" + sensorId + "?ts_start=2010-05-01&ts_end=2015-06-10&step=1hours";
        jQuery.get(url, function (results) {
            drawGoogleHotSpot("hotSpotContainer", results);
        });
    })
}

var showGoogleAnnotation = function () {
        var sensorId = Router.current().params._id;
        var url = "/api/measurements/" + sensorId + "?ts_start=2010-06-07&ts_end=2015-06-10";
        jQuery.get(url, function (results) {
            drawGoogleAnnotation("annotationContainer", results);
        });
}

var showGoogleHeadMap = function () {
    $(document).ready(function () {
        var sensorId = Router.current().params._id;
        var url = "/api/measurements/" + sensorId + "?ts_start=2010-04-01&ts_end=2016-04-10&step=1hours";
        jQuery.get(url, function (results) {
            drawGoogleHeatMap("heatMapContainer", results);
        });
    })
};

Template.visMeter.onRendered(function () {
    Deps.autorun(function (){
    showGoogleMeter();
    showGoogleHotSpot();
    showGoogleGauge();
     showGoogleAnnotation();
        showGoogleHeadMap();
    });
});

Template.visMeter.helpers({
    myid: function () {
        return this._id.toHexString();
    }
});

Template.visMeter.events({
    'click .js-cancel': function () {
        Session.set(EDITING_KEY, false);
    },

    'keydown input[type=text]': function (event) {
        // ESC
        if (27 === event.which) {
            event.preventDefault();
            $(event.target).blur();
        }
    },

    'blur input[type=text]': function (event, template) {
        // if we are still editing (we haven't just clicked the cancel button)
        if (Session.get(EDITING_KEY))
            saveSensor(this, template);
    },

    'click .js-edit-list': function (event, template) {
        Router.go('sensorsShow', {_id: this._id.toHexString()});
    },

    // handle mousedown otherwise the blur handler above will swallow the click
    // on iOS, we still require the click event so handle both
    'mousedown .js-cancel, click .js-cancel': function (event) {
        event.preventDefault();
        Session.set(EDITING_KEY, false);
    },

    'click .js-todo-add': function (event, template) {
        template.$('.js-todo-new input').focus();
    },

    'submit .js-todo-new': function (event) {
        event.preventDefault();

        var $input = $(event.target).find('[type=text]');
        if (!$input.val())
            return;

        Measurements.insert({
            sensorId: this._id.toHexString(),
            value: $input.val(),
            timeStamp: new Date()
        });
        Sensors.update(this._id, {$inc: {measurementCount: 1}});
        $input.val('');
    }
});
