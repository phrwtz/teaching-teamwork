var logManagerUrl = 'http://teaching-teamwork-log-manager.herokuapp.com/api/logs',
    log = {},
    session;

function _generateGUID() {
  function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  }
  return S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4();
}

function _sendEvent(data) {
  var request = new XMLHttpRequest();
  request.open('POST', logManagerUrl, true);
  request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  request.send(JSON.stringify(data));
}

log.startSession = function() {
  session = _generateGUID();

  log.logEvent("Started session");
}

log.logEvent = function(eventName, value, parameters) {
  var data = {
    application: "Teaching Teamwork Demo",
    activity: activityName,
    username: username,
    session: session,
    time: (Date.now()/1000),
    event: eventName,
    event_value: value,
    parameters: parameters
  }

  _sendEvent(data);

}
