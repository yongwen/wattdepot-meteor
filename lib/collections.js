Sensors = new Mongo.Collection('sensors', {idGeneration: 'MONGO'});

// Calculate a default name for a list in the form of 'List A'
Sensors.defaultName = function() {
  var nextLetter = 'A', nextName = 'Sensor ' + nextLetter;
  while (Sensors.findOne({name: nextName})) {
    // not going to be too smart here, can go past Z
    nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
    nextName = 'Sensor ' + nextLetter;
  }

  return nextName;
};

Measurements = new Mongo.Collection('measurements', {idGeneration: 'MONGO'});
if (Meteor.isServer){
  Measurements._ensureIndex({sensorId: 1, timeStamp: 1});
}
