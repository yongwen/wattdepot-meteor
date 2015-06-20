/**
 * Created by yxu on 6/12/2015.
 */
var getDayDiffs = function(date, startDate) {
    return Math.floor((date - startDate)/(24*3600*1000));
};

drawD3HeatMap = function (container, data) {
    // data format: [{_id: {year:y, month:m, day:d, hour:h}, avg:v}] sorted by _id
    // dataTable format: [{time:t, value:v, row:r, col:c}]
    var dataTable = [];

    var startDate = new Date(data[0]._id.year, data[0]._id.month-1, data[0]._id.day, data[0]._id.hour);
    var endDate = new Date(data[data.length-1]._id.year, data[data.length-1]._id.month-1, data[data.length-1]._id.day, data[data.length-1]._id.hour);

    var days = getDayDiffs(endDate, startDate)+1;
    console.log(days);

    for (var i=0; i<data.length; i++) {
        //var col = i % 24;
        //var row = parseInt(i / 24);
        var time = new Date(data[i]._id.year, data[i]._id.month-1, data[i]._id.day, data[i]._id.hour);
        var row = getDayDiffs(time, startDate);
        dataTable.push({
            row: row,
            col: data[i]._id.hour,
            time: time,
            value: data[i].avg});
    }

//height of each row in the heatmap
//width of each column in the heatmap
    var h = 18, w = 20;
    var margin = {top: 50, right: 10, bottom: 50, left: 80},
        width = 24*w,
        height = days*h;

    console.log(height);

    var colorLow = d3.rgb(0, 200, 0), colorHigh = d3.rgb(255,0,0);

    var colorScale = d3.scale.linear()
            .domain([d3.min(dataTable, function(d) {return d.value}), d3.max(dataTable, function(d) {return d.value})])
            .range([colorLow, colorHigh])
        ;

    var xScale = d3.time.scale()
            .domain([new Date(2011, 0, 1, 0), new Date(2011, 0, 1, 23)])
            .range([0, 23*w])
        ;

    var yScale = d3.time.scale()
            .domain([d3.min(dataTable, function(d) {return d.time}),d3.max(dataTable, function(d) {return d.time})])
            .range([0, height])
        ;

    var svg = d3.select(container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        ;

    svg.selectAll(".heatmap")
        .data(dataTable)
        .enter().append("svg:rect")
        .attr("x", function (d) {return d.col * w})
        .attr("y", function (d) {return d.row * h})
        .attr("width", function (d) {return w})
        .attr("height", function (d) {return h})
        .style("fill", function (d) {return colorScale(d.value)})
        // Here we add an SVG title element the contents of which is effectively rendered in a tooltip
        .append("svg:title")
        .text(function(d) { return d3.round(d.value, 3) + " @ " + d3.time.format("%x, %I %p")(d.time); })
    ;

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate("+w/2+")")
        .call(d3.svg.axis()
            .scale(xScale)
            .orient("top")
            .tickFormat(function (d) {return d3.time.format("%I %p")(new Date(d))})
            .ticks(d3.time.hour, 1)
        )
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "3em")
        .attr("dy", "1em")
        .attr("transform", function (d) {
            return "rotate(-90)";
        });
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate("+w/2+", "+height+")")
        .call(d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .tickFormat(function (d) {return d3.time.format("%I %p")(d)})
            .ticks(d3.time.hour, 1)
    )
        .selectAll("text")
        .attr("dx", "-2em")
        .attr("dy", "-0.5em")
        .attr("transform", function (d) {
            return "rotate(270)";
        });

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0,"+h/2+")")
        .call(d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .tickFormat(function (d) {
                return d3.time.format("%b %d,%Y")(d)})
            .ticks(days)
    );
};