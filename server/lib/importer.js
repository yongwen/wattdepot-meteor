importCSV = function() {
    var fs = Npm.require('fs');
    var path = Npm.require('path');
    var basepath = path.resolve('.').split('.meteor')[0];
    var csv = '/data/greenbutton.csv';

    CSV.parse()
    CSV().from.stream(
        fs.createReadStream(basepath+csv),
        {'escape': '\\'})
        .on('record', Meteor.bindEnvironment(function(row, index) {
                console.log(row[0]);
                console.log(row[1]);
                console.log(row[2]);

                //or implement your insert to a mongo collection

            }, function(error) {
                console.log('Error in bindEnvironment:', error);
            }
        ))
        .on('error', function(err) {
            console.log('Error reading CSV:', err);
        })
        .on('end', function(count) {
            console.log(count, 'records read');
        });
};