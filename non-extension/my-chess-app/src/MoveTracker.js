import React from 'react';
import './MoveTracker.css';

function MoveTracker() {
  const moves = [
    ['1', 'e4', 'e5'],
    ['2', 'Nf3', 'Nc6'],
    ['3', 'Bc4', 'Nf6'],
    ['4', 'd3', 'd6'],
    ['5', 'O-O', ''],
  ];

  const rows = moves.map((move) => (
    <tr key={move[0]}>
      <td>{move[0]}</td>
      <td>
        <button>{move[1]}</button>
      </td>
      <td>
        <button>{move[2]}</button>
      </td>
    </tr>
  ));

  return (
    <div className="MoveTracker">
      <h4>C44: King's Knight Opening: Normal Variation</h4>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>White</th>
            <th>Black</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export default MoveTracker;
