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
    <PageView activity={ ttWorkbench } />,
    document.getElementById('content')
  );

  userController.init(ttWorkbench.clients.length, function(clientNumber) {
    React.render(
      <PageView activity={ ttWorkbench } circuit={ (1 * clientNumber)+1 }/>,
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
  <PageView />,
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

