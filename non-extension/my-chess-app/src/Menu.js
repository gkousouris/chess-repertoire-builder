import React from 'react';
import './Menu.css';

function Menu() {
  return (
    <div className="menu">
      <h2>Menu</h2>
      <label htmlFor="sideToPlay">Side to play:</label>
      <select id="sideToPlay">
        <option value="white">White to play</option>
        <option value="black">Black to play</option>
      </select>
      <br />
      <button>Enter / Import Repertoire</button>
      <br />
      <textarea placeholder="Enter repertoire" value="1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. d3 Bc5 (4... h6 5. Nc3) 5. O-O"></textarea>
      <br />
      <button>Input a game</button>
      <br />
      <textarea placeholder="Enter game moves" value="1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. d3 d6 5. O-O Ng4 6. Nfd2 Qh4 7. a4 Qxh2#"></textarea>
      <br />
      <button className="evaluateButton">Where did my opening go wrong?</button>
    </div>
  );
}

export default Menu;
