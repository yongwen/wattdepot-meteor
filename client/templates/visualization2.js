/**
 * Created by yxu on 5/28/2015.
 */

Template.visualization2.helpers({
    myid: function() { return this._id.toHexString();}
});

Template.visualization2.onRendered(function() {
  Deps.autorun(function () {
        //d3.select("#chart").selectAll("g").remove();

        var measurements = Measurements.find();
        var data = [{key: "Stream",
            values : []
        }];

        measurements.forEach(function (measurement) {
            //console.log(measurement.timeStamp);
            data[0].values.push({x: measurement.timeStamp.valueOf(), y: measurement.value});
        });

        var chart;
        nv.addGraph(function() {
            chart = nv.models.lineWithFocusChart();
            chart.height(280);
            chart
                .xScale(d3.time.scale()) // use a time scale instead of plain numbers in order to get nice round default values in the axis
                .duration(0)
            ;
            var tickMultiFormat = d3.time.format.multi([
                ["%b %-d %-I:%M%p", function(d) { return d.getMinutes(); }], // not the beginning of the hour
                ["%b %-d %-I%p", function(d) { return d.getHours(); }], // not midnight
                ["%b %-d", function(d) { return d.getDate() != 1; }], // not the first of the month
                ["%b %-d", function(d) { return d.getMonth(); }], // not Jan 1st
                ["%Y", function() { return true; }]
            ]);
            chart.xAxis
                .showMaxMin(false)
                .tickPadding(10)
                .tickFormat(function (d) { return tickMultiFormat(new Date(d)); })
            ;
            chart.x2Axis
                .showMaxMin(false)
                .tickPadding(10)
                .tickFormat(function(d) { return d3.time.format('%m/%d/%y')(new Date(d)) })
            ;
            chart.yAxis
                .showMaxMin(false)
                .tickFormat(d3.format(",.0f"))
            ;

            chart.y2Axis
                .showMaxMin(false)
                .tickFormat(d3.format(",.0f"))
            ;
            var svgElem = d3.select('#chart');
            svgElem
                .datum(data)
                .transition()
                .call(chart);

            nv.utils.windowResize(chart.update);

            // set up the tooltip to display full dates
            var tsFormat = d3.time.format('%b %-d, %Y %I:%M%p');
            //tooltip.headerFormatter(function (d) { return tsFormat(new Date(d)); });
            return chart;
        });
      });
});

Template.visualization2.events({
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
