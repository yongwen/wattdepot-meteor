/**
 * Created by yxu on 5/28/2015.
 */
var DAILY_CHART_END_MONTH = "end_month";
var DAILY_CHART_END_YEAR = "end_year";

Template.visDaily.helpers({
    myid: function () {
        return this._id.toHexString();
    },
    endMonth: function () {
        return Session.get(DAILY_CHART_END_MONTH);
    },
    endYear: function () {
        return Session.get(DAILY_CHART_END_YEAR);
    },
    dailyDataReady: function() {return Session.get("dailyDataReady");},
});

var showDailyChart = function () {
    var data = [{
        key: "Stream",
        values: []
    }];

    Meteor.call("get_d_measurements",
        Router.current().params._id,
        function (err, measurements) {
            console.log("err="+err);
            console.log("result=" + measurements.length);
            for (var i = 0; i < measurements.length; i++) {
                var value = {
                    x: (new Date(measurements[i]._id.year, measurements[i]._id.month - 1, measurements[i]._id.day)).valueOf(),
                    y: measurements[i].avg
                };
                if (i == 0) {
                    Session.set(DAILY_CHART_END_YEAR, measurements[i]._id.year);
                    Session.set(DAILY_CHART_END_MONTH, measurements[i]._id.month);
                }
                data[0].values.push(value);
            }
            ;
            Session.set("dailyDataReady", true);

            if (data[0].values.length > 0) {
                showLineWithFocusChart('#daily_chart', data);
            } else {
                console.log("g remove");
                $("g").remove();

                showLineWithFocusChart('#daily_chart', data);
            }
        });
};

Template.visDaily.onRendered(function () {
    showDailyChart();
});
