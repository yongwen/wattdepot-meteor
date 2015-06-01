var EDITING_KEY = 'editingList';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.sensorsShow.onRendered(function() {
  if (firstRender) {
    // Released in app-body.js
    listFadeInHold = LaunchScreen.hold();

    // Handle for launch screen defined in app-body.js
    listRenderHold.release();

    firstRender = false;
  }

  this.find('.js-title-nav')._uihooks = {
    insertElement: function(node, next) {
      $(node)
        .hide()
        .insertBefore(next)
        .fadeIn();
    },
    removeElement: function(node) {
      $(node).fadeOut(function() {
        this.remove();
      });
    }
  };
});

Template.sensorsShow.helpers({
  editing: function() {
    return Session.get(EDITING_KEY);
  },

  myid: function() { return this._id.toHexString();},

  measurementsReady: function() {
    return Router.current().measurementsHandle.ready();
  },

  measurements: function(sensorId) {
    return Measurements.find({sensorId: sensorId.toHexString()});
  }
});

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

Template.sensorsShow.events({
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
