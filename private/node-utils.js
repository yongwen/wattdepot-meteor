var importCSV = function (request, csvfile, sensorId) {
    var fs = require('fs');
    var parse = require('babyparse');
    var config = {};

    fs.readFile(csvfile, 'utf-8', function (err, f) {
        var obj = parse.parse(f, config);
        //console.log(obj);

        obj.data.forEach(function (line, lineNum) {
            var timeStamp = new Date(line[0]);  // timestamp
            var value = parseFloat(line[1]);  // value
            console.log("importing " + timeStamp);
            insertMeasurement(request, sensorId, timeStamp, value);
        });
    });
};

var insertMeasurement = function (request, sensorId, timeStamp, value) {
    //insert to measurements
    var url = 'http://localhost:3000/api/measurement/' + sensorId;

    //request.debug = true;
    request({
        url: url,
        method: "POST",
        json: true,
        body: {value: value, timeStamp: timeStamp}
    }, function (error, response, body) {
        if (error) console.log(error);
    });
};

module.exports.insertSensor = function (sensor) {
    var url = 'http://localhost:3000/api/sensor';
    var request = require('request');
    //request.debug = true;
    request({
        url: url,
        method: "POST",
        json: true,
        body: {name: sensor.name, location: sensor.file}
    }, function (error, response, body) {
        if (error) console.log(error);
        //console.log(response.body);
        importCSV(request, sensor.file, response.body._str);
    });
};