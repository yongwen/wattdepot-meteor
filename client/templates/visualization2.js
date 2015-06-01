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
            chart.height(380);
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

