var sensors = [
    //{name: "test", file: "test.csv"},
//    {name: "2014 Hourly Temperature SFO", file: "2014HourlyTemperatureSFO.csv"},
//    {name: "2014 Hourly Energy eGauge", file: "2014HourlyEnergyEgauge.csv"},
//    {name: "2014 Hourly Solar eGauge", file: "2014HourlySolarEgauge.csv"},
    {name: "2014 Hourly GreenButton SDGE", file: "2014HourlyGreenbuttonSDGE.csv"},
//    {name: "2015 Hourly Energy eGauge", file: "2015HourlyEnergyEgauge.csv"},
];

sensors.forEach(function (sensor) {
    require('./node-utils.js').insertSensor(sensor);
});
