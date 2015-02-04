require('./chat.jsx');

module.exports = PageView = React.createClass({
  render: function() {
    return (
      <div className="tt-page">
        <h1>Teaching Teamwork Demo</h1>
        <h2>Circuit <span id="circuit-number" /></h2>
        <div id="breadboard-wrapper"></div>
        <ChatView />
        <div id="image-wrapper"><img src="circuit.png" /></div>
      </div>
    );
  }
});
