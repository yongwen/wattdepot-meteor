
// Visualization to show current power data.
// data format: {value: 100, min: 20, max: 200}

drawGoogleMeter = function (container, data) {
    // http://code.google.com/apis/visualization/documentation/gallery/genericimagechart.html

    var width = 300, height = 120;
    var googleChartUrl = googleOMeterUrl(width, height, data.value, data.min, data.max);
    console.log(googleChartUrl);
    jQuery("#"+container).html("<img src='" + googleChartUrl + "'/>");

    function googleOMeterUrl(width, height, value, min, max) {
        return "http://chart.googleapis.com/chart?cht=gom&" +
            "chco=3CB371,FFFF00,FF0000&" +  // color
            "chxt=x,y&" +  // visible axes
            "chf=bg,s,00000000&" +  // background file, the last 00 indicates transparency
            "chls=3|10&" +   // line thickness and arrowhead size
            "chma=5,5,5,5&" +  // margin
            "chs=" + width + "x" + height + "&" +  // width and height
            "chds=" + min + "," + max + "&" +  // data scale with min max
            "chxl=0:|" + value + "|1:|" + min + "|" + max + "&" +  // label
            "chd=t:" + value; // data
    }
};

drawGoogleGauge = function (container, data) {
    console.log(data);
    var options = {
        width: 400, height: 120,
        greenFrom: data.min, greenTo: (data.max + data.min)/3,
        yellowFrom: (data.max + data.min)/3, yellowTo: (data.max + data.min)*2/3,
        redFrom: (data.max + data.min)*2/3, redTo: data.max,
        min: data.min,
        max: data.max,
        minorTicks: 5
    };

    var data = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['Value', data.value],
    ]);

    var chart = new google.visualization.Gauge(document.getElementById(container));

    chart.draw(data, options);
}

drawGoogleHotSpot = function (container, data) {
    //console.log(data);

    var options = {
        height: 2500,
        width: 700,
        chartArea: {width: '80%', height: '80%'},
        colors:['green','red'],
        hAxis: {title: 'time', gridlines: {count:13}},
        vAxis: {title: 'day', gridlines: {count: 9}},
        sizeAxis:{maxSize:10,minSize:5},
    };

    var dataTable = getDataTable(data);
    console.log(dataTable);
    var chart = new google.visualization.BubbleChart(document.getElementById(container));
    chart.draw(dataTable, options);

    function getDataTable(data) {
        var dataTable = new google.visualization.DataTable();

        dataTable.addColumn('string', 'ID');
        dataTable.addColumn('number', 'time');   // x
        dataTable.addColumn('number', 'date');   // y
        dataTable.addColumn('number', '');       // color
        dataTable.addColumn('number', 'value');  // size

        for (var i=0; i<data.length; i++) {
            value = Math.round(data[i].avg);
            dataTable.addRow(['', data[i]._id.hour, data[i]._id.day + (data[i]._id.month-1)*30, value, value]);
        }

        return dataTable;
    };

};

drawGoogleAnnotation = function (container, data) {
    //console.log(data);

    var chart = new google.visualization.AnnotationChart(document.getElementById(container));

    var options = {
        height: 400,
        displayAnnotations: true
    };

    var dataTable = getDataTable(data);
    chart.draw(dataTable, options);

    function getDataTable(data) {
        var dataTable = new google.visualization.DataTable();
        dataTable.addColumn('date', 'Date');
        dataTable.addColumn('number', 'Value');
        for (var i=0; i<data.length; i++) {
            dataTable.addRow([new Date(data[i].timeStamp), +data[i].value]);
        }
        return  dataTable;
    };
};

drawGoogleHeatMap = function(container, data) {
    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'Day');
    for (var i = 0; i<24; i++)
        dataTable.addColumn('number', i+":00");

    var rows = Math.ceil(data.length/24);
    dataTable.addRows(rows);
    for (var i=0; i<rows; i++)
        dataTable.setCell(i, 0, "day "+data[i*24]._id.day);

    for (var i=0; i<data.length; i++) {
        var col = i % 24 + 1;
        var row = parseInt(i / 24);
        dataTable.setCell(row, col, Math.round(data[i].avg));
    }
    var options = {
        cellHeight: 18,
        cellWidth: 28,
        numberOfColors: 64,
        passThroughBlack: false,
        drawBorder: false,
    };

    heatmap = new org.systemsbiology.visualization.BioHeatMap(document.getElementById(container));
    //console.log(dataTable);
    heatmap.draw(dataTable, options);
}
