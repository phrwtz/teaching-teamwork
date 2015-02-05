require('./goalTable.jsx');

var userController  = require('../controllers/user'),
    logController   = require('../controllers/log');

module.exports = ChatView = React.createClass({
  getInitialState: function() {
    this.items = [];
    return {items: [], text: ""};
  },
  componentWillMount: function() {
    var self = this;
    userController.onGroupRefCreation(function() {
      self.firebaseRef = userController.getFirebaseGroupRef().child("chat");
      self.firebaseRef.on("child_added", function(dataSnapshot) {
        self.items.push(dataSnapshot.val());
        self.setState({
          items: self.items
        });
      }.bind(self));
    });
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
          <form onSubmit={ this.handleSubmit }>
            Send chat:
              <input onChange={ this.onChange } value={ this.state.text }type="text" size="70" id="send-chat" />
              <button id="send" onClick={ this.handleSubmit }>Send</button>
              { sendMeas }
          </form>
        </div>
      </div>
    );
  }
});
