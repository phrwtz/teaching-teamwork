require('./chat.jsx');

var config = require('../config');

module.exports = PageView = React.createClass({
  render: function() {
    var title,
        activity = this.props.activity ? this.props.activity : {},
        image = null,
        chat = null;
    if (activity.name) {
      title = <h1>Teaching Teamwork: { activity.name }</h1>
    } else {
      title = <h1>Teaching Teamwork</h1>
    }

    if (activity.image) {
      image = <img src={ config.modelsBase + activity.image } />
    }

    if (activity.clients && activity.clients.length > 1) {
      chat = <ChatView {...activity} />
    }
    return (
      <div className="tt-page">
        { title }
        <h2>Circuit { this.props.circuit }</h2>
        <div id="breadboard-wrapper"></div>
        { chat }
        <div id="image-wrapper">{ image }</div>
      </div>
    );
  }
});
