(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./views/page.jsx');

var WorkbenchAdaptor      = require('./data/workbenchAdaptor'),
    WorkbenchFBConnector  = require('./data/workbenchFBConnector'),
    logController         = require('./controllers/log'),
    userController        = require('./controllers/user'),
    config                = require('./config'),
    activityName;

function startActivity(activityName, ttWorkbench) {
  var workbenchAdaptor, workbenchFBConnector;

  logController.init(activityName);
  React.render(
    React.createElement(PageView, {activity: ttWorkbench }),
    document.getElementById('content')
  );

  userController.init(ttWorkbench.clients.length, function(clientNumber) {
    React.render(
      React.createElement(PageView, {activity: ttWorkbench, circuit:  (1 * clientNumber)+1}),
      document.getElementById('content')
    );

    logController.setClientNumber(clientNumber);
    workbenchAdaptor = new WorkbenchAdaptor(clientNumber)
    workbenchFBConnector = new WorkbenchFBConnector(userController, clientNumber, workbenchAdaptor);
    workbench = workbenchAdaptor.processTTWorkbench(ttWorkbench);
    sparks.createWorkbench(workbench, "breadboard-wrapper");
  });

}

function loadActivity(activityName) {
  var activityUrl = config.modelsBase + activityName + ".json";

  var request = new XMLHttpRequest();
  request.open('GET', activityUrl, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      var data = JSON.parse(request.responseText);
      startActivity(activityName, data);
    } else {
      alert("Could not find activity at "+activityUrl);
    }
  };

  request.send();
}

// render initial page
React.render(
  React.createElement(PageView, null),
  document.getElementById('content')
);

// load blank workbench
sparks.createWorkbench({"circuit": []}, "breadboard-wrapper");

// load and start activity
activityName = window.location.hash;
activityName = activityName.substring(1,activityName.length);
if (!activityName){
  activityName = "two-resistors";
}

loadActivity(activityName);



},{"./config":2,"./controllers/log":3,"./controllers/user":4,"./data/workbenchAdaptor":5,"./data/workbenchFBConnector":6,"./views/page.jsx":9}],2:[function(require,module,exports){
module.exports = {
  modelsBase: "activities/"
}


},{}],3:[function(require,module,exports){
var logManagerUrl = 'http://teaching-teamwork-log-manager.herokuapp.com/api/logs',
    session,
    username,
    groupname,
    client,
    queue = [],

    generateGUID = function() {
      function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
      }
      return S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4();
    },

    sendEvent = function(data) {
      var request = new XMLHttpRequest();
      request.open('POST', logManagerUrl, true);
      request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
      request.send(JSON.stringify(data));
    },

    backfillQueue = function(key, value) {
      for (var i = 0, ii = queue.length; i < ii; i++) {
        queue[i][key] = value;
      }
    },

    processQueue = function() {
      while (queue.length) {
        var event = queue.shift();
        sendEvent(event);
      }
    },

    logEvent = function(eventName, value, parameters) {
      var data = {
        application: "Teaching Teamwork",
        activity: activityName,
        username: username,
        groupname: groupname,
        board: client,
        session: session,
        time: (Date.now()/1000),
        event: eventName,
        event_value: value,
        parameters: parameters
      }

      if (!client) {
        queue.push(data);
      } else {
        sendEvent(data);
      }
    },

    startSession = function() {
      session = generateGUID();
      logEvent("Started session");
    };

function LogController() {
}

LogController.prototype = {
  logEvent: logEvent,

  init: function(_activityName) {
    activityName = _activityName;
    startSession();
  },

  setUserName: function(name) {
    username = name;
    backfillQueue("username", username);
    logEvent("Selected Username", username);
  },

  setGroupName: function(name) {
    groupname = name;
    backfillQueue("groupname", groupname);
    logEvent("Joined Group", groupname);
  },

  setClientNumber: function(clientNumber) {
    client = clientNumber;
    backfillQueue("board", client);
    processQueue();
    logEvent("Selected board", client);
  }
};

module.exports = new LogController();


},{}],4:[function(require,module,exports){
require('../views/userRegistration.jsx');

var logController = require('./log'),
    numClients,
    userName,
    groupName,
    firebaseGroupRef,
    firebaseUsersRef,
    fbUrl,
    groupUsersListener,
    boardsSelectionListener,
    client,
    callback;

// scratch
var fbUrlBase = 'https://teaching-teamwork.firebaseio.com/dev/';

var getDate = function() {
  var today = new Date(),
      dd = today.getDate(),
      mm = today.getMonth()+1,
      yyyy = today.getFullYear();

  if(dd<10) {
      dd='0'+dd
  }

  if(mm<10) {
      mm='0'+mm
  }

  return yyyy+'-'+mm+'-'+dd;
}


module.exports = {

  init: function(_numClients, _callback) {
    numClients = _numClients;
    callback = _callback;
    UserRegistrationView.open(this, {form: "username"});
  },

  setName: function(name) {
    userName = name;
    logController.setUserName(userName);
    if (numClients > 1) {
      UserRegistrationView.open(this, {form: "groupname"});
    } else {
      UserRegistrationView.close();
      callback(0);
    }
  },

  checkGroupName: function(name) {
    var date = getDate(),
        self = this;

    groupName = name;

    fbUrl = fbUrlBase + date + "-" + name + "/";

    firebaseGroupRef = new Firebase(fbUrl);
    firebaseUsersRef = firebaseGroupRef.child('users');
    groupUsersListener = firebaseUsersRef.on("value", function(snapshot) {
      var users = snapshot.val();
      // pass only other users in the room
      if (users) {
        delete users[userName];
      }
      UserRegistrationView.open(self, {form: "groupconfirm", users: users});
    });

    firebaseUsersRef.child(userName).set({lastAction: Math.floor(Date.now()/1000)});

    logController.logEvent("Started to join group", groupName);
  },

  rejectGroupName: function() {
    // clean up
    firebaseUsersRef.once("value", function(snapshot) {
      var users = snapshot.val();
      delete users[userName];
      if (Object.keys(users).length) {
        // delete ourselves
        firebaseUsersRef.child(userName).remove();
      } else {
        // delete the room if we are the only member
        firebaseGroupRef.remove();
      }
    });
    UserRegistrationView.open(this, {form: "groupname"});

    logController.logEvent("Rejected Group", groupName);
  },

  setGroupName: function(name) {
    var self = this;
    groupName = name;
    firebaseUsersRef.off("value", groupUsersListener);

    logController.setGroupName(groupName);

    // annoyingly we have to get out of this before the off() call is finalized
    setTimeout(function(){
      boardsSelectionListener = firebaseUsersRef.on("value", function(snapshot) {
        var users = snapshot.val();
        UserRegistrationView.open(self, {form: "selectboard", numClients: numClients, users: users});
      });
    }, 1);
  },

  selectClient: function(_client) {
    client = _client;
    firebaseUsersRef.child(userName).set({client: client, lastAction: Math.floor(Date.now()/1000)});
  },

  selectedClient: function() {
    firebaseUsersRef.off("value");
    UserRegistrationView.close();
    callback(client);
  },

  getUsername: function() {
    return userName;
  },

  getFirebaseGroupRef: function() {
    return firebaseGroupRef;
  },

  getOtherClientNos: function() {
    var ret = [];
    for (var i = 0; i < numClients; i++) {
      if (i !== client) ret.push(i);
    }
    return ret;
  }

}


},{"../views/userRegistration.jsx":10,"./log":3}],5:[function(require,module,exports){
/**
 The workbench adaptor takes a TT-workbench definition such as

{
  externalComponents: [
    { comp1 ... connections: "0:a1,1:b2" }
  ],
  clients: [
    {
      circuit: [
        { comp2 ... connections: "a1,b2" },
      ],
      view_prop1: x,
      view_prop2: x
    },
    {
      circuit: [
        { comp3 ... connections: "a1,b2" },
      ],
      view_prop1: y,
      view_prop2: y
    }
 }

 and transforms it for consumption by breadboard.js to (in this case for client-0):

{
  circuit: [
    { comp1 ..., connections: "a1,1:b2", hidden: true },
    { comp2 ..., connections: "a1,b2" },
    { comp3 ..., connections: "1:a1,1:b2", hidden: true }
  ],
  view_prop1: x,
  view_prop2: x
}

when client-0 makes changes, it pushes just those component values to the backend.
**/

WorkbenchAdaptor = function(client) {
  this.client = client;
}

WorkbenchAdaptor.prototype = {
  processTTWorkbench: function(ttWorkbench) {
    var workbenchDef = {
         circuit: []
        },
        comps, comp, clients, ownCircuit, clientProps,
        i, ii, j, jj;

    // copy externalComponents as hidden components
    comps = ttWorkbench.externalComponents
    if (comps) {
      for (i = 0, ii = comps.length; i < ii; i++) {
        comp = comps[i];
        this.validate(comp);
        comp.hidden = true;
        // removes any x: from connection if x == client
        comp.connections = comp.connections.replace(new RegExp(this.client+":","g"),"")
        workbenchDef.circuit.push(comp);
      }
    }

    // copy client components, hiding those that aren't the client's
    clients = ttWorkbench.clients
    for (i = 0, ii = clients.length; i < ii; i++) {

      comps = clients[i].circuit;
      ownCircuit = i == this.client;

      if (comps) {
        for (j = 0, jj = comps.length; j < jj; j++) {
          comp = comps[j];
          this.validate(comp);
          comp.hidden = !ownCircuit;
          // transforms other clients connections, e.g. "a1,b2", to "0:L1,0:L2"
          if (!ownCircuit) {
            comp.connections = i+":"+comp.connections.split(",").join(","+i+":");
            comp.connections = comp.connections.replace(/[abcde](\d)/g,"L$1");
            comp.connections = comp.connections.replace(/[fghij](\d)/g,"L$1");
          }
          workbenchDef.circuit.push(comp);
        }
      }

    }

    // copy non-circuit properties from the appropriate client def
    clientProps = ttWorkbench.clients[this.client];
    for (prop in clientProps) {
      if (clientProps.hasOwnProperty(prop) && prop !== "circuit") {
        workbenchDef[prop] = clientProps[prop];
      }
    }

    return workbenchDef;
  },

  validate: function (comp) {
    if (!comp.type) {
      throw new Error("Component is missing a type");
    }
    if (!comp.connections && !(comp.UID == "source")) {
      throw new Error("Component is missing connections");
    }
  },

  getClientCircuit: function() {
    var circuit = JSON.parse(sparks.workbenchController.serialize()).circuit,
        ownCircuit = [];

    for (var i = 0, ii = circuit.length; i < ii; i++) {
      var comp = circuit[i];
      if (!~comp.connections.indexOf(":") && comp.type !== "powerLead") {
        // ugly
        var nodes = comp.connections.split(","),
            bbHoles = sparks.workbenchController.breadboardController.getHoles();
        if (bbHoles[nodes[0]] || bbHoles[nodes[1]]) {
          ownCircuit.push(comp);
        }
      }
    }

    return ownCircuit;
  },

  updateClient: function(client, circuit) {
    var clientCircuit = [];
    for (var i = 0, ii = circuit.length; i < ii; i++) {
      comp = circuit[i];
      // transforms other clients connections, e.g. "a1,b2", to "0:a1,0:b2"
      comp.connections = client+":"+comp.connections.split(",").join(","+client+":");
      comp.connections = comp.connections.replace(/[abcde](\d)/g,"L$1");
      comp.connections = comp.connections.replace(/[fghij](\d)/g,"L$1");
      clientCircuit.push(comp);
    }

    // update in place
    var circuit = JSON.parse(sparks.workbenchController.serialize()).circuit;
    for (var i = 0, ii = circuit.length; i < ii; i++) {
      var comp = circuit[i];
      if (comp.connections.indexOf(client+":") !== comp.connections.lastIndexOf(client+":")) {
        sparks.workbenchController.breadboardController.remove(comp.type, comp.connections);
      }
    }

    for (i = 0, ii = clientCircuit.length; i < ii; i++) {
      var comp = clientCircuit[i];
      comp.hidden = true;
      sparks.workbenchController.breadboardController.insertComponent(comp.type, comp);
    }
    sparks.workbenchController.workbench.meter.update();
  }
}

module.exports = WorkbenchAdaptor;


},{}],6:[function(require,module,exports){
var clientListFirebaseRef,
    myCircuitFirebaseRef,
    clientNumber,
    wa;

function init() {
  sparks.logController.addListener(function(evt) {
    if (evt.name = "Changed circuit") {
      myCircuitFirebaseRef.set(wa.getClientCircuit());
    }
  });

  // scratch
  var otherClients = userController.getOtherClientNos();
  for (var i = 0, ii = otherClients.length; i < ii; i++) {
    var otherClient = otherClients[i];
    addClientListener(otherClient);
  }
}

function addClientListener(client) {
  clientListFirebaseRef.child(client).on("value", function(snapshot) {
    wa.updateClient(client, snapshot.val());
  });
}


function WorkbenchFBConnector(_userController, _clientNumber, _wa) {
  if (!_userController.getFirebaseGroupRef()) {
    return;
  }
  userController = _userController;
  clientNumber = _clientNumber;
  clientListFirebaseRef = userController.getFirebaseGroupRef().child('clients');
  myCircuitFirebaseRef = clientListFirebaseRef.child(clientNumber);

  wa = _wa;
  init();
}

module.exports = WorkbenchFBConnector;


},{}],7:[function(require,module,exports){
require('./goalTable.jsx');

var userController  = require('../controllers/user'),
    logController   = require('../controllers/log');

module.exports = ChatView = React.createClass({displayName: "ChatView",
  getInitialState: function() {
    this.items = [];
    return {items: [], text: ""};
  },
  componentWillMount: function() {
    var fbUrl = 'https://teaching-teamwork.firebaseio.com';
    fbUrl += "/dev";
    // fbUrl += "/demo";

    this.firebaseRef = new Firebase(fbUrl+"/chat/");
    this.firebaseRef.on("child_added", function(dataSnapshot) {
      this.items.push(dataSnapshot.val());
      this.setState({
        items: this.items
      });
    }.bind(this));
  },
  componentWillUnmount: function() {
    this.firebaseRef.off();
  },
  onChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    this.firebaseRef.push({
      user: userController.getUsername(),
      message: this.state.text
    });
    logController.logEvent("Sent message", this.state.text);
    this.setState({text: ""});
  },
  handleSendVal: function(e) {
    e.preventDefault();
    var val   = sparks.workbenchController.workbench.meter.dmm.currentValue,
      units = sparks.workbenchController.workbench.meter.dmm.currentUnits || "V";

    this.firebaseRef.push({
      user: userController.getUsername(),
      message: val+" "+units,
      val: val,
      units: units
    });
    logController.logEvent("Sent value", val+" "+units);
  },
  render: function() {

    var table = null,
        sendMeas = null;

    if (this.props.simpleMeasurementGame) {
      table = React.createElement(GoalTable, React.__spread({},  this.props.simpleMeasurementGame))
      sendMeas = React.createElement("button", {id: "send-val", onClick:  this.handleSendVal}, "Send measurement")
    }

    return (
      React.createElement("div", {id: "chat"}, 
        React.createElement("div", {id: "messages"}, 
          this.state.items.map(function(item) {
            return React.createElement("div", {className: "chat"}, React.createElement("b", null,  item.user, ":"), " ",  item.message)
          })
        ), 
        table, 
        React.createElement("div", {id: "input"}, 
          "Send chat:", 
            React.createElement("input", {onChange:  this.onChange, value:  this.state.text, type: "text", size: "70", id: "send-chat"}), 
            React.createElement("button", {id: "send", onClick:  this.handleSubmit}, "Send"), 
            sendMeas 
        )
      )
    );
  }
});


},{"../controllers/log":3,"../controllers/user":4,"./goalTable.jsx":8}],8:[function(require,module,exports){
module.exports = GoalTable = React.createClass({displayName: "GoalTable",
  render: function() {
    var rows = this.props.goal.map(function(val, i) {
      return (React.createElement("tr", null, 
                React.createElement("td", null,  i+1), 
                React.createElement("td", null, val ), 
                React.createElement("td", {className: "actual"})
              )
              );
    });
    return (
      React.createElement("div", {id: "values"}, 
        React.createElement("table", null, 
          React.createElement("tr", null, 
            React.createElement("th", null), 
            React.createElement("th", null, "Goal (",  this.props.measurement, ")"), 
            React.createElement("th", null, "Actual")
          ), 
          rows 
        )
      )
    );
  }
});


},{}],9:[function(require,module,exports){
require('./chat.jsx');

var config = require('../config');

module.exports = PageView = React.createClass({displayName: "PageView",
  render: function() {
    var title,
        activity = this.props.activity ? this.props.activity : {},
        image = null;
    if (activity.name) {
      title = React.createElement("h1", null, "Teaching Teamwork: ",  activity.name)
    } else {
      title = React.createElement("h1", null, "Teaching Teamwork")
    }

    if (activity.image) {
      image = React.createElement("img", {src:  config.modelsBase + activity.image})
    }
    return (
      React.createElement("div", {className: "tt-page"}, 
        title, 
        React.createElement("h2", null, "Circuit ",  this.props.circuit), 
        React.createElement("div", {id: "breadboard-wrapper"}), 
        React.createElement(ChatView, React.__spread({},  activity)), 
        React.createElement("div", {id: "image-wrapper"}, image )
      )
    );
  }
});


},{"../config":2,"./chat.jsx":7}],10:[function(require,module,exports){
var userController;

module.exports = UserRegistrationView = React.createClass({displayName: "UserRegistrationView",
  statics: {
    // open a dialog with props object as props
    open: function(_userController, data) {
      userController = _userController;
      var $anchor = $('#user-registration');
      if (!$anchor.length) {
        $anchor = $('<div id="user-registration" class="modalDialog"></div>').appendTo('body');
      }

      setTimeout(function(){
        $('#user-registration')[0].style.opacity = 1;},
      100);

      return React.render(
        React.createElement(UserRegistrationView, React.__spread({},  data)),
        $anchor.get(0)
      );
    },

    // close a dialog
    close: function() {
      React.unmountComponentAtNode($('#user-registration').get(0));
      $('#user-registration').remove();
    }
  },
  getInitialState: function() {
    return {userName: '', groupName: ''};
  },
  handleUserNameChange: function(event) {
    this.setState({userName: event.target.value});
  },
  handleGroupNameChange: function(event) {
    this.setState({groupName: event.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    if (this.props.form == "username") {
      userController.setName(this.state.userName);
    } else {
      userController.checkGroupName(this.state.groupName);
    }
  },
  handleJoinGroup: function() {
    userController.setGroupName(this.state.groupName);
  },
  handleRejectGroup: function() {
    this.setState({groupName: ''});
    userController.rejectGroupName();
  },
  handleClientSelection: function() {
    userController.selectClient(event.target.value);
  },
  handleClientSelected: function(e) {
    e.preventDefault();
    userController.selectedClient();
  },
  render: function() {
    var form;
    if (this.props.form == 'username') {
      form = (
        React.createElement("div", null, 
          React.createElement("h3", null, " "), 
          React.createElement("label", null, 
            React.createElement("span", null, "User Name :"), 
            React.createElement("input", {type: "text", value: this.state.userName, onChange: this.handleUserNameChange})
          )
        )
      );
    } else if (this.props.form == 'groupname') {
      form = (
        React.createElement("div", null, 
          React.createElement("h3", null, "Hi ",  this.state.userName, "!"), 
          React.createElement("label", null, 
            React.createElement("span", null, "Group Name :"), 
            React.createElement("input", {type: "text", value: this.state.groupName, onChange: this.handleGroupNameChange})
          )
        )
      );
    } else if (this.props.form == 'groupconfirm') {
      var groupDetails,
          joinStr,
          keys = Object.keys(this.props.users);
      if (keys.length == 0) {
        groupDetails = (
          React.createElement("div", null, 
            React.createElement("label", null, "You are the first member of this group.")
          )
        );
      } else {
        groupDetails = (
          React.createElement("div", null, 
            React.createElement("label", null, "These are the people currently in this group:"), 
            React.createElement("ul", null, 
              keys.map(function(result) {
                return React.createElement("li", null, React.createElement("b", null, result));
              })
            )
          )
        );
      }

      joinStr = (keys.length ? "join" : "create");

      form = (
        React.createElement("div", null, 
          React.createElement("h3", null, "Group name: ",  this.state.groupName), 
          groupDetails, 
          React.createElement("label", null, " "), 
          React.createElement("span", null, "Do you want to ", joinStr, " this group?"), 
          React.createElement("label", null, 
            React.createElement("button", {onClick:  this.handleJoinGroup}, "Yes, ", joinStr ), 
            React.createElement("button", {onClick:  this.handleRejectGroup}, "No, enter a different group")
          )
        )
      );
    } else if (this.props.form == 'selectboard') {
      var clientChoices = [],
          submittable = false;
      for (var i = 0, ii = this.props.numClients; i < ii; i++) {
        var userSpan = ( React.createElement("i", null, "currently unclaimed") ),
            isOwn = false,
            selected = false,
            valid = true,
            selectedUsers = [];
        for (user in this.props.users) {
          if (this.props.users[user].client == i) {
            selectedUsers.push(user);
            if (user == this.state.userName) {
              isOwn = true;
              selected = true;
            }
            if (selectedUsers.length > 1) {
              valid = false;
            }
            userSpan = ( React.createElement("span", {className:  valid ? "" : "error"},  selectedUsers.join(", ") ) );
          }
        }
        if (isOwn && selectedUsers.length == 1) {
          submittable = true;
        }

        clientChoices.push(
          React.createElement("div", null, 
            React.createElement("input", {type: "radio", name: "clientSelection", defaultChecked: selected, value: i, onClick:  this.handleClientSelection}), "Circuit ",  i+1, " (", userSpan, ")"
          ) );
      }

      form = (
        React.createElement("div", null, 
          clientChoices, 
          React.createElement("label", null, 
            React.createElement("button", {disabled:  !submittable, onClick:  this.handleClientSelected}, "Select")
          )
        )
      );
    }

    return (
      React.createElement("form", {onSubmit:  this.handleSubmit}, 
        form 
      )
    );
  }
});


},{}]},{},[1]);
