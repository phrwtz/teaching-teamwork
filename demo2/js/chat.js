var fb = new Firebase('https://teaching-teamwork.firebaseio.com/demo2/chat');

function sendChat(message) {
  log.logEvent("Sent message", message, {circuit: circuitName});
  fb.push({user: circuitName, message: message, val: "x"});
}

function sendValue(val, units) {
  log.logEvent("Sent value", val+" "+units, {circuit: circuitName, value: val, units: units});
  fb.push({user: circuitName, message: val+" "+units, val: val, units: units});
}

var ignore = true;

setTimeout(function() {
  ignore = false;
}, 2000);

fb.on("child_added", function(ret) {
  var data = ret.val(),
      user = data ? data.user.toUpperCase() : "",
      message = data ? data.message : "",
      val = data ? data.val : "x";
  if (!ignore) {
    div = $("<div class='chat'><b>"+user+":</b> "+message+"</div>");
    if (data.user == circuitName) {
      div.addClass("me");
    }
    $("#messages").append(div);

    $('#messages').stop().animate({
      scrollTop: $("#messages")[0].scrollHeight
    }, 800);

    if (!isNaN(val) && ~data.units.indexOf("V")){
      $("#"+data.user+"-actual").text(val).removeClass("stale");
    }
  }
});

$("#send").on('click', function() {
  sendChat($("#send-chat").val());
});

$('#send-chat').bind('keypress', function(e) {
  var code = e.keyCode || e.which;
   if(code == 13) { //Enter keycode
     sendChat($("#send-chat").val());
     $("#send-chat").val("");
   }
});

$("#send-val").on('click', function(e) {
  var val   = sparks.workbenchController.workbench.meter.dmm.currentValue,
      units = sparks.workbenchController.workbench.meter.dmm.currentUnits || "V";
  sendValue(val, units);
});
