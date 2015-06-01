/**
 * Created by yxu on 5/28/2015.
 */
var chart;
DATA_COUNT = 0;
var VIS_VIEWPORT_SIZE = 1000;

Template.visualization.helpers({
    myid: function() { return this._id.toHexString();}
});

Template.visualization.onRendered(function() {

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

    Deps.autorun(function () {
        d3.select("#chartContainer").selectAll("svg").remove();

        var svg = dimple.newSvg("#chartContainer", "100%", 500);

        var measurements = Measurements.find();
        var data = [];
        measurements.forEach(function (measurement) {
            data.push({timeStamp: measurement.timeStamp.toLocaleString(), value: measurement.value});
        });

        console.log("data=" + data.length);
        chart = new dimple.chart(svg, data);
        //chart.setBounds(60, 30, 500, 280);
        chart.setMargins("60px", "30px", "60px", "170px");

        var x = chart.addTimeAxis("x", "timeStamp", "%m/%d/%Y, %I:%M:%S %p", "%Y-%m-%d %H:%M:%S");
        x.addOrderRule("Date");
       /*
        x.overrideMin = new Date("2015-05-27");
        x.overrideMax = new Date("2015-05-30");
      */
        // Show a label for every 1 days.
        //x.timePeriod = d3.time.minutes;
        //x.timeInterval = 1;

        chart.addMeasureAxis("y", "value");
        var s = chart.addSeries(null, dimple.plot.line);

        // Add line markers to the line because it looks nice
        //s.lineMarkers = true;

        chart.draw();

        // Invoke the cleaning algorithm to draw 1 label in every 20
        //cleanAxis(x, 3);
    });

    // Add a method to draw the chart on resize of the window
    window.onresize = function () {
        // As of 1.1.0 the second parameter here allows you to draw
        // without reprocessing data.  This saves a lot on performance
        // when you know the data won't have changed.
        chart.draw(0, true);
    };
});

