import {Pgn} from "./cm-pgn/src/cm-pgn/Pgn.js";

let btn = document.querySelector('#show');

btn.addEventListener('click', function () {
  let repertoire = window.parent.document.querySelector('#repertoire').value;
  let game_moves = window.parent.document.querySelector('#game').value;

  const params = new URLSearchParams({
    repertoire: repertoire,
    game_moves: game_moves
  });

  const url = `http://127.0.0.1:5000/evaluateMove?${params.toString()}`;


  fetch(url)
    .then(data => data.text())
    .then(response => {
      const data = JSON.parse(response);
      document.getElementById('result').innerHTML = data.message
      const movesList = window.parent.document.getElementById("moves-list");
      for (const move of data.moves) {
        const listItem = window.parent.document.createElement("li");
        listItem.textContent = move;
        movesList.appendChild(listItem);
      }
    });
    
  // Use this for dev instead of actual API calls
  const response = '{ "message": "Opponent played d5 deviating from your prep.", "moves": [ "Your move: exd5 (popularity: 55.0%, eval: 1.0)", "", "Opponent has 3 good move(s) in this position", "Opponent has a 0.0% chance to commit a mistake", "Opponent has a 0.0% chance to commit a blunder", "Your move: Nxe5 (popularity: 27.1%, eval: 0.7)", "", "Opponent has 3 good move(s) in this position", "Opponent has a 0.0% chance to commit a mistake", "Opponent has a 0.0% chance to commit a blunder", "Your move: d4 (popularity: 6.2%, eval: 0.3)", "", "Opponent has 3 good move(s) in this position", "Opponent has a 0.0% chance to commit a mistake", "Opponent has a 0.0% chance to commit a blunder" ] }'




});
