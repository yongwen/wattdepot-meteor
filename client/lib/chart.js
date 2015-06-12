/**
 * Created by yxu on 6/3/2015.
 */
showLineChart = function(div, data) {
    d3.select(div).selectAll("svg").remove();

    var svg = dimple.newSvg(div, "100%", 350);

    //console.log("data=" + data.length);
    chart = new dimple.chart(svg, data);
    //chart.setBounds(60, 30, 500, 280);
    //chart.setMargins("60px", "30px", "60px", "170px");

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

    // Add a method to draw the chart on resize of the window
    window.onresize = function () {
        // As of 1.1.0 the second parameter here allows you to draw
        // without reprocessing data.  This saves a lot on performance
        // when you know the data won't have changed.
        chart.draw(0, true);
    };
};
/*
 <svg id="chart" class="nvd3-svg"><text class="nvd3 nv-noData" dy="-.7em" x="346.5" y="150" style="text-anchor: middle;">No Data Available.</text></svg>
*/
showLineWithFocusChart = function(div, data) {
    console.log(data[0].values.length);
    nv.addGraph(function () {
        var chart;
        chart = nv.models.lineWithFocusChart();
        chart.height(400);
        chart
            //.xScale(d3.time.scale()) // use a time scale instead of plain numbers in order to get nice round default values in the axis
            .duration(0)
        ;
        var tickMultiFormat = d3.time.format.multi([
            ["%b %-d %-I:%M%p", function (d) {
                return d.getMinutes();
            }], // not the beginning of the hour
            ["%b %-d %-I%p", function (d) {
                return d.getHours();
            }], // not midnight
            ["%b %-d", function (d) {
                return d.getDate() != 1;
            }], // not the first of the month
            ["%b %-d", function (d) {
                return d.getMonth();
            }], // not Jan 1st
            ["%Y", function () {
                return true;
            }]
        ]);
        chart.xAxis
            .showMaxMin(false)
            .tickPadding(10)
            .tickFormat(function (d) {
                return tickMultiFormat(new Date(d));
            })
        ;
        chart.x2Axis
            .showMaxMin(false)
            .tickPadding(10)
            .tickFormat(function (d) {
                return d3.time.format('%m/%d/%y')(new Date(d))
            })
        ;
        chart.yAxis
            .showMaxMin(false)
            .tickFormat(d3.format(",.2f"))
        ;

        chart.y2Axis
            .showMaxMin(false)
            .tickFormat(d3.format(",.2f"))
        ;
        var svgElem = d3.select(div);
        svgElem
            .datum(data)
            .transition()
            .call(chart);

        nv.utils.windowResize(chart.update);

        // set up the tooltip to display full dates
        var tsFormat = d3.time.format('%b %-d, %Y %I:%M%p');
        //tooltip.headerFormatter(function (d) { return tsFormat(new Date(d)); });
//        return chart;
    });
}