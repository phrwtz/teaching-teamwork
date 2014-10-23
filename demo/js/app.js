var circuitName;
while (circuitName !== "a" && circuitName !== "b" && circuitName !== "c") {
  if(window.location.hash) {
    circuitName = window.location.hash.substr(1);
  } else {
    circuitName = window.prompt("Which board are you (a, b or c)?","").toLowerCase();
  }
}

var stale = false;

function setStale() {
  stale = true;
  $(".actual").addClass("stale");
}

$("#circuit-number").text(circuitName.toUpperCase());

var dataStore = new DataStore(circuitName);

dataStore.init(function(initialCircuit) {
  sparks.workbenchController.createWorkbench(initialCircuit, "breadboard-wrapper");

  sparks.breadboardView.removeComponent("r1")
  getBreadBoard().components = {};

  if (circuitName == "a") {
    model = [
     {
      "type": "battery",
      "UID": "source",
      "connections": "b,a",
      "hide": true,
      "voltage": 9
     },
     {
      "type": "resistor",
      "UID": "unk",
      "resistance": 100,
      "connections": "b,c",
      "hide": true
     },
     {
         "type": "wire",
         "connections": "c,a30",
          "hide": true
      },
      {
         "type": "wire",
         "connections": "a30,a20"
      },
      {
         "type": "resistor",
         "UID": "ar1",
         "resistance": "100",
         "connections": "c13,c20",
         "label": "R1"
      },
      {
         "type": "wire",
         "connections": "a1,a13"
      },
      {
         "type": "wire",
         "connections": "j22,g17"
      },
      {
         "type": "wire",
         "connections": "j22,a",
          "hide": true
      },
      {
         "type": "wire",
         "connections": "a1,brl",
          "hide": true
      },
      {
         "type": "resistor",
         "UID": "br1",
         "resistance": "100",
         "connections": "brl,brr",
          "hide": true
      },
      {
         "type": "resistor",
         "UID": "cr1",
         "resistance": "100",
         "connections": "brr,a",
          "hide": true
      }
    ]
  } else if (circuitName == "b") {
    model = [
     {
      "type": "battery",
      "UID": "source",
      "connections": "b,a",
      "hide": true,
      "voltage": 9
     },
     {
      "type": "resistor",
      "UID": "unk",
      "resistance": 100,
      "connections": "b,c",
      "hide": true
     },
      {
         "type": "resistor",
         "UID": "ar1",
         "resistance": "100",
         "connections": "c,d",
          "hide": true
      },
     {
         "type": "wire",
         "connections": "d,a30",
          "hide": true
      },
      {
         "type": "wire",
         "connections": "a30,a20"
      },
      {
         "type": "resistor",
         "UID": "br1",
         "resistance": "100",
         "connections": "c13,c20",
         "label": "R1"
      },
      {
         "type": "wire",
         "connections": "a1,a13"
      },
      {
         "type": "wire",
         "connections": "j22,g17"
      },
      {
         "type": "wire",
         "connections": "j22,a",
          "hide": true
      },
      {
         "type": "wire",
         "connections": "a1,brr",
          "hide": true
      },
      {
         "type": "resistor",
         "UID": "cr1",
         "resistance": "100",
         "connections": "brr,a",
          "hide": true
      }
    ]
  } else {
    model = [
     {
      "type": "battery",
      "UID": "source",
      "connections": "b,a",
      "hide": true,
      "voltage": 9
     },
     {
      "type": "resistor",
      "UID": "unk",
      "resistance": 100,
      "connections": "b,c",
      "hide": true
     },
      {
         "type": "resistor",
         "UID": "ar1",
         "resistance": "100",
         "connections": "c,d",
          "hide": true
      },
      {
         "type": "resistor",
         "UID": "br1",
         "resistance": "100",
         "connections": "d,e",
          "hide": true
      },
     {
         "type": "wire",
         "connections": "e,a30",
          "hide": true
      },
      {
         "type": "wire",
         "connections": "a30,a20"
      },
      {
         "type": "resistor",
         "UID": "cr1",
         "resistance": "100",
         "connections": "c13,c20",
         "label": "R1"
      },
      {
         "type": "wire",
         "connections": "a1,a13"
      },
      {
         "type": "wire",
         "connections": "a1,a",
          "hide": true
      }
    ]
  }



  breadModel('createCircuit', model);

  var res = initialCircuit.circuit[0].resistance;
  dataStore.lastVal = res;

  $(".add_components").hide();

  mainLoop = function() {
    res = getBreadBoard().components[circuitName+"r1"].resistance;
    dataStore.setResistorValue(res);

    dataStore.update(function(ret) {
      changed = false;
      for (board in ret) {
        res = 1 * ret[board].circuit[0].resistance;
        if (res !== getBreadBoard().components[board+"r1"].resistance) {
          changed = true;
          getBreadBoard().components[board+"r1"].resistance = res;
        }
      }
      if (changed) {
        sparks.workbenchController.workbench.meter.update();
        setStale();
      }
    });
  }

  setInterval(mainLoop, 5000);
});


