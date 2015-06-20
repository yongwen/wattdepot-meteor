/**
 * Created by yxu on 5/28/2015.
 */
var context = cubism.context()
    .serverDelay((new Date()) - (new Date(2015, 0, 1)))
    .clientDelay(0)
    .step(60 * 60 * 1000)
    .size(30 * 24);

function showCubismChart(container, data) {
    var extents = [
        [0, 100],
        [0, 10],
        [0, 5],
        [-10, 40],
        [-10, 40],
    ];

    d3.select(container).call(function (div) {
        div.append("div")
            .attr("class", "axis")
            .call(
            context.axis()
                .orient("top")
        );

        div.selectAll(".horizon")
            .data(data.map(wattdepot))
            .enter().append("div")
            .attr("class", "horizon")
            .call(
            context.horizon()
//                .extent(function (d, i) { return extents[i];})
                .title(function (d, i) { return data[i].name;})
                .height(60)
                .format(d3.format(".2r"))
        );

        div.append("div")
            .attr("class", "rule")
            .call(context.rule());

    });

    context.on("focus", function (i) {
        d3.selectAll(".value").style("right", i == null ? null : context.size() - i + "px");
    });

    context.on("change", function (start, stop) {
        d3.select("#update-time").text("Last updated at " + d3.time.format("%I %p %b %d,%Y")(stop) + ".");
    });
}

function wattdepot(sensor) {
    return context.metric(function (start, stop, step, callback) {
        var url = "http://localhost:3000/api/measurements/" + sensor.id + "?" +
            "ts_start=" + start.toJSON() +
            "&ts_end=" + stop.toJSON() +
            "&limit=" + context.size();
        console.log(url);
        d3.json(url,
            function (data) {
                //console.log(data);
                if (!data) return callback(new Error("unable to load data"));

                callback(null, data.map(function (d) {
                    return d.value;
                }));
            });
    }).shift(-10 * 3600 * 1000);
}

Template.sensors.helpers({});

Template.sensors.onRendered(function () {
    var sensors = Sensors.find();
    var data = [];
    sensors.forEach(function (sensor) {
        data.push({id: sensor._id.toHexString(), name: sensor.name});
    });
    showCubismChart("#chartContainer", data);
});

Template.sensors.events({});
