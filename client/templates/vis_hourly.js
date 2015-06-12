/**
 * Created by yxu on 5/28/2015.
 */

Template.visHourly.helpers({
    myid: function () {
        return Router.current().params._id;
    },
    year: function () {
        return Router.current().params.year;
    },
    month: function () {
        return Router.current().params.month;
    },
    previousMonth: function () {
        return parseInt(Router.current().params.month) - 1;
    },
    nextMonth: function () {
        return parseInt(Router.current().params.month) + 1;
    },
    dataReady: function() {return Session.get("data_ready");},
});

var showChart = function () {
    var year = parseInt(Router.current().params.year);
    var month = parseInt(Router.current().params.month);
    var data = [{
        key: "Stream",
        values: []
    }];

    Meteor.call("get_h_measurements",
        Router.current().params._id, Router.current().params.year, Router.current().params.month,
        function (err, measurements) {
            console.log("result=" + measurements.length);
            measurements.forEach(function (measurement) {
                var value = {
                    x: (new Date(year, month - 1, measurement._id.day, measurement._id.hour)).valueOf(),
                    y: measurement.avg
                };
                //console.log(value);
                data[0].values.push(value);
            });

            Session.set("data_ready", true);

            if (data[0].values.length > 0) {
                showLineWithFocusChart('#hourly_chart', data);
            } else {
                console.log("g remove");
                $("g").remove();

                showLineWithFocusChart('#hourly_chart', data);
            }
        });
};

Template.visHourly.onRendered(function () {
    Deps.autorun(showChart);
});

