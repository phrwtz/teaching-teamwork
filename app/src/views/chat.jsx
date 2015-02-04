require('./goalTable.jsx');

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
      user: window.username,
      message: this.state.text
    });
    this.setState({text: ""});
  },
  render: function() {

    return (
      <div id="chat">
        <div id="messages">
          {this.state.items.map(function(item) {
            return <div className='chat'><b>{ item.user }:</b> { item.message }</div>
          })}
        </div>
        <GoalTable />
        <div id="input">
          Send chat: <input onChange={ this.onChange } value={ this.state.text }type="text" size="70" id="send-chat" /><button id="send" onClick={ this.handleSubmit }>Send</button><button id="send-val">Send measurement</button>
        </div>
      </div>
    );
  }
});
