var circuitTopology = {
  'a': {left: 'b', right: 'c'},
  'b': {left: 'a', right: 'c'},
  'c': {left: 'a', right: 'b'}
};

var fbUrl = 'https://teaching-teamwork.firebaseio.com';

DataStore = function(circuitName) {
  var worldName = "demo";
  this.circuitName = circuitName;
  this.model = {};
  this.left  = circuitTopology[circuitName].left;
  this.right = circuitTopology[circuitName].right;

  worldUrl = fbUrl+'/'+worldName;

  this.fbRefs = {
    'current': new Firebase(worldUrl    + '/currentCircuit'),
    'initial':  new Firebase(worldUrl  + '/initialCircuit/' + this.circuitName),
    'a': new Firebase(worldUrl    + '/currentCircuit/a'),
    'b': new Firebase(worldUrl    + '/currentCircuit/b'),
    'c': new Firebase(worldUrl    + '/currentCircuit/c'),
    'res': new Firebase(worldUrl    + '/currentCircuit/'+this.circuitName+'/circuit/0')
  }
}

DataStore.prototype = {

  init: function (callback) {
    var _this = this;
    this.fbRefs[this.circuitName].once('value', function(snapshot) {
      var data = snapshot.val();
      var woocircuit;
      if (data && data.circuit) {
        woocircuit = data.circuit;
      }
      _this.fbRefs.initial.once('value', function(snapshot) {
        var data = snapshot.val();
        if (!woocircuit)
          _this.fbRefs[this.circuitName].update({circuit: data.circuit});
        if (woocircuit)
          data.circuit = woocircuit;
        callback(data);
      });
    });
  },

  setCircuit: function (circuit) {
    this.fbRefs[this.circuitName].update(circuit);
  },

  lastVal: 0,
  setResistorValue: function(val) {
    if (val !== this.lastVal) {
      setStale();
      log.logEvent("Modified circuit", {circuit: circuitName, component: "R1", newValue: val});
      this.fbRefs.res.update({resistance: val});
      this.lastVal = val;
    }
  },

  update: function (callback) {
    var _this = this;
    this.fbRefs.current.once('value', function(snapshot) {
      var data = snapshot.val();
      ret = {};
      ret[_this.left] = data[_this.left];
      ret[_this.right] = data[_this.right];
      callback(ret);
    });
  }
}




// *******************
/**
"teaching-teamwork": {
demo: {
  initialCircuit: {
    a: {
      "show_oscilloscope": "true",
      "show_multimeter": "true",
       "allow_move_yellow_probe": "true",
       "circuit": [
           {
               "type": "battery",
               "UID": "source",
               "voltage": 20
           },
           {
               "type": "resistor",
               "UID": "r2",
               "resistance": "100",
               "connections": "c17,c23",
               "label": "R1"
           },
           {
               "type": "wire",
               "connections": "left_negative19,a23"
           },
           {
               "type": "wire",
               "connections": "left_positive8,a17"
           }
       ],
    },
    b: {
      "show_oscilloscope": "true",
      "show_multimeter": "true",
       "allow_move_yellow_probe": "true",
       "circuit": [
           {
               "type": "battery",
               "UID": "source",
               "voltage": 20
           },
           {
               "type": "resistor",
               "UID": "r2",
               "resistance": "100",
               "connections": "c17,c23",
               "label": "R1"
           },
           {
               "type": "wire",
               "connections": "left_negative19,a23"
           },
           {
               "type": "wire",
               "connections": "left_positive8,a17"
           }
       ],
    },
    c: {
      "show_oscilloscope": "true",
      "show_multimeter": "true",
       "allow_move_yellow_probe": "true",
       "circuit": [
           {
               "type": "battery",
               "UID": "source",
               "voltage": 20
           },
           {
               "type": "resistor",
               "UID": "r2",
               "resistance": "100",
               "connections": "c17,c23",
               "label": "R1"
           },
           {
               "type": "wire",
               "connections": "left_negative19,a23"
           },
           {
               "type": "wire",
               "connections": "left_positive8,a17"
           }
       ],
    }
  },
  currentCircuit: {}
}
}
*/
