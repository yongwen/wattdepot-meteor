/**
 * Created by yxu on 5/28/2015.
 */
var chart;
DATA_COUNT = 0;
var VIS_VIEWPORT_SIZE = 1000;

Template.visualization.helpers({
    myid: function() { return this._id.toHexString();}
});

// Pass in an axis object and an interval.
var cleanAxis = function (axis, oneInEvery) {
    // This should have been called after draw, otherwise do nothing
    if (axis.shapes.length > 0) {
        // Leave the first label
        var del = false;
        // If there is an interval set
        if (oneInEvery > 1) {
            // Operate on all the axis text
            axis.shapes.selectAll("text")
                .each(function (d) {
                    // Remove all but the nth label
                    if (del % oneInEvery !== 0) {
                        this.remove();
                        // Find the corresponding tick line and remove
                        axis.shapes.selectAll("line").each(function (d2) {
                            if (d === d2) {
                                this.remove();
                            }
                        });
                    }
                    del += 1;
                });
        }
    }
};

Template.visualization.onRendered(function() {
        var measurements = Measurements.find();
        var data = [];
        measurements.forEach(function (measurement) {
            data.push({timeStamp: measurement.timeStamp.toLocaleString(), value: measurement.value});
        });
        showLineChart("#chartContainer", data);
});

Template.visualization.events({
    'click .js-cancel': function() {
        Session.set(EDITING_KEY, false);
    },

    'keydown input[type=text]': function(event) {
        // ESC
        if (27 === event.which) {
            event.preventDefault();
            $(event.target).blur();
        }
    },

    'blur input[type=text]': function(event, template) {
        // if we are still editing (we haven't just clicked the cancel button)
        if (Session.get(EDITING_KEY))
            saveSensor(this, template);
    },

    'click .js-edit-list': function(event, template) {
        Router.go('sensorsShow', {_id: this._id.toHexString()});
    },

    // handle mousedown otherwise the blur handler above will swallow the click
    // on iOS, we still require the click event so handle both
    'mousedown .js-cancel, click .js-cancel': function(event) {
        event.preventDefault();
        Session.set(EDITING_KEY, false);
    },

    'click .js-todo-add': function(event, template) {
        template.$('.js-todo-new input').focus();
    },

    'submit .js-todo-new': function(event) {
        event.preventDefault();

        var $input = $(event.target).find('[type=text]');
        if (! $input.val())
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
