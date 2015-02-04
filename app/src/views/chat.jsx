require('./goalTable.jsx');

var userController = require('../controllers/user');

module.exports = ChatView = React.createClass({
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
    log.logEvent("Sent message", this.state.text);
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
    log.logEvent("Sent value", val+" "+units);
  },
  render: function() {

    var table = null,
        sendMeas = null;

    if (this.props.simpleMeasurementGame) {
      table = <GoalTable {...this.props.simpleMeasurementGame}/>
      sendMeas = <button id="send-val" onClick={ this.handleSendVal }>Send measurement</button>
    }

    return (
      <div id="chat">
        <div id="messages">
          {this.state.items.map(function(item) {
            return <div className='chat'><b>{ item.user }:</b> { item.message }</div>
          })}
        </div>
        { table }
        <div id="input">
          Send chat:
            <input onChange={ this.onChange } value={ this.state.text }type="text" size="70" id="send-chat" />
            <button id="send" onClick={ this.handleSubmit }>Send</button>
            { sendMeas }
        </div>
      </div>
    );
  }
});
