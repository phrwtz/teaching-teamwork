require('./chat.jsx');

module.exports = PageView = React.createClass({
  render: function() {
    var title;
    if (this.props.name) {
      title = <h1>Teaching Teamwork: { this.props.name }</h1>
    } else {
      title = <h1>Teaching Teamwork</h1>
    }
    return (
      <div className="tt-page">
        { title }
        <h2>Circuit { this.props.circuit }</h2>
        <div id="breadboard-wrapper"></div>
        <ChatView />
        <div id="image-wrapper"><img src="circuit.png" /></div>
      </div>
    );
  }
});
