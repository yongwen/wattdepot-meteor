var EDITING_KEY = 'editingList';
var FEED_STATES = 'feed_states';
var FEED_TIMERS = 'feed_timers';
var START_VALUE = 100;

Session.setDefault(EDITING_KEY, false);

var editSensor = function(sensor, template) {
  Session.set(EDITING_KEY, true);

  // force the template to redraw based on the reactive change
  Tracker.flush();
  template.$('.js-edit-form input[type=text]').focus();
};

var saveSensor = function(sensor, template) {
  Session.set(EDITING_KEY, false);
  Sensors.update(sensor._id, {$set: {name: template.$('[name=name]').val()}});
}

var deleteSensor = function(sensor) {
  // ensure the last public list cannot be deleted.
  if (! Sensors.find().count() === 1) {
    return alert("Sorry, you cannot delete the final public list!");
  }

  var message = "Are you sure you want to delete the list " + sensor.name + "?";
  if (confirm(message)) {
    // we must remove each item individually from the client
    Measurements.find({sensorId: sensor._id.toHexString()}).forEach(function(measurement) {
      Measurements.remove(measurement._id);
    });
    Sensors.remove(sensor._id);

    Router.go('home');
    return true;
  } else {
    return false;
  }
};

// use Meteor collection to feed measurement
var insert_measurement = function (sensorId, value) {
  var measurement = {
    sensorId: sensorId,
    value: value,
    timeStamp: new Date()
  };
  //console.log(measurement);
  Measurements.insert(measurement);

  var sensorObjectId = new Mongo.ObjectID(sensorId);
  Sensors.update(sensorObjectId, {$inc: {measurementCount: 1}});
};

// use RestAPI to feed measurement
var post_measurement = function (sensorId, value) {
  var url = '/api/measurement/' + sensorId;
  $.post(url, {value: value});
};

var random_measurement = function (sensorId, value) {
  value = value + Math.floor(Math.random() * 20 - 10);
    if (value < 0) {
        value = START_VALUE;
    }

  post_measurement(sensorId, value);
  return value;
};

var setSessionMap = function(name, key, value) {
  var map = Session.get(name);
  if (map) {
    map[key] = value;
    Session.set(name, map);
  } else {
    var map = {};
    map[key] = value;
    Session.set(name, map);
  }
};

var setResetInterval = function(bool, sensorId, value){

  if(bool){

    var timer = setInterval(function(){
      value = random_measurement(sensorId, value)},1000);

    setSessionMap(FEED_TIMERS, sensorId, timer);
    setSessionMap(FEED_STATES, sensorId, true);
  } else {
    clearInterval(Session.get(FEED_TIMERS)[sensorId]);
    setSessionMap(FEED_STATES, sensorId, false);
  }
};

Template.sensorsShow.helpers({
  editing: function() {
    return Session.get(EDITING_KEY);
  },

  feed_state: function() {
    var feed_states = Session.get(FEED_STATES);
    if (feed_states) {
      return feed_states[this._id.toHexString()];
    } else {
      return false;
    }
  },

  myid: function() { return this._id.toHexString();},

  measurementsReady: function() {
    return Router.current().measurementsHandle.ready();
  },

  measurements: function(sensorId) {
    return Measurements.find({},{sort: {timeStamp: -1}});
  }
});

Template.sensorsShow.events({
  'click #start_feed': function(e){
    e.preventDefault();
    setResetInterval(true, this._id.toHexString(), START_VALUE);
  },

  'click #stop_feed': function(e){
    e.preventDefault();
    setResetInterval(false, this._id.toHexString());
    Session.set("START_FEED_STATE", false);
  },

  'click .js-cancel': function() {
    Session.set(EDITING_KEY, false);
  },

  'keydown input[type=text]': function(event) {
    // ESC
    if (27 === event.which) {
      event.preventDefault();
      $(event.target).blur();
    }
  },

  'blur input[type=text]': function(event, template) {
    // if we are still editing (we haven't just clicked the cancel button)
    if (Session.get(EDITING_KEY))
      saveSensor(this, template);
  },

  'submit .js-edit-form': function(event, template) {
    event.preventDefault();
    saveSensor(this, template);
  },

  // handle mousedown otherwise the blur handler above will swallow the click
  // on iOS, we still require the click event so handle both
  'mousedown .js-cancel, click .js-cancel': function(event) {
    event.preventDefault();
    Session.set(EDITING_KEY, false);
  },

  'change .list-edit': function(event, template) {
    if ($(event.target).val() === 'edit') {
      editSensor(this, template);
    } else if ($(event.target).val() === 'delete') {
      deleteSensor(this, template);
    } else if ($(event.target).val() === 'chart') {
      Router.go('visualization', {_id: this._id.toHexString()});
    } else if ($(event.target).val() === 'focus_chart') {
      Router.go('visualization2', {_id: this._id.toHexString()});
    };
    event.target.selectedIndex = 0;
  },

  'click .js-edit-list': function(event, template) {
    editSensor(this, template);
  },

  'click .js-delete-list': function(event, template) {
    deleteSensor(this, template);
  },

  'click .js-todo-add': function(event, template) {
    template.$('.js-todo-new input').focus();
  },

  'submit .js-todo-new': function(event) {
    event.preventDefault();

    var $input = $(event.target).find('[type=text]');
    if (! $input.val())
      return;

    Measurements.insert({
      sensorId: this._id.toHexString(),
      value: $input.val(),
      timeStamp: new Date()
    });
    Sensors.update(this._id, {$inc: {measurementCount: 1}});
    $input.val('');
  }
});
