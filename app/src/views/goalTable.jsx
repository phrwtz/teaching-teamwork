module.exports = GoalTable = React.createClass({
  render: function() {
    return (
      <div id="values">
        <table>
          <tr>
            <th></th>
            <th>Goal (V)</th>
            <th>Actual</th>
          </tr>
          <tr>
            <td>A</td>
            <td>8.56</td>
            <td id="a-actual" className="actual"></td>
          </tr>
          <tr>
            <td>B</td>
            <td>5.55</td>
            <td id="b-actual" className="actual"></td>
          </tr>
          <tr>
            <td>C</td>
            <td>5.3</td>
            <td id="c-actual" className="actual"></td>
          </tr>
        </table>
      </div>
    );
  }
});
