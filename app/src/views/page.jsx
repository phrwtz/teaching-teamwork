require('./chat.jsx');

module.exports = PageView = React.createClass({
  render: function() {
    var title,
        activity = this.props.activity ? this.props.activity : {}
    if (activity.name) {
      title = <h1>Teaching Teamwork: { activity.name }</h1>
    } else {
      title = <h1>Teaching Teamwork</h1>
    }
    return (
      <div className="tt-page">
        { title }
        <h2>Circuit { this.props.circuit }</h2>
        <div id="breadboard-wrapper"></div>
        <ChatView {...activity} />
        <div id="image-wrapper"><img src="circuit.png" /></div>
      </div>
    );
  }
});
