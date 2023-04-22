import {Pgn} from "./cm-pgn/src/cm-pgn/Pgn.js";

// function findFirstDiscrepancy(repertoire, game) {
//   let curr_parent = repertoire;
//   let index = 0;
//
//   for (let i =0; i<game.length; i++){
//
//     if (curr_parent[index].san == game[i].san) {
//       index += 1
//       continue;
//     }
//     const sans = curr_parent[index].variations.map(obj => obj[0].san);
//     if (sans.includes(game[i].san)) {
//       curr_parent = curr_parent[index].variations[sans.indexOf(game[i].san)]
//       index = 0;
//       continue;
//     }
//     let message = ''
//     if (i % 2 == 0) { // TODO: Make this work for black repertoires
//       let move_num = (i + 2) / 2;
//       message += 'You played ' + move_num + ". " + game[i].san + ', whereas your repertoire has ' + (curr_parent.length > 0 ? move_num + ". " +curr_parent[index].san + "  YOU DEVIATED :dissaproval_face:, can't help you" : 'ended');
//     } else {
//       message += 'Black played ' + (i + 1) / 2 + ". ..." + game[i].san + ', which was not in your repertoire. You should study it.'
//     }
//     document.getElementById('result').innerHTML = message;
//     break;
//   }
//
// }

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

  // const response = '{ "message": "Opponent played d5 deviating from your prep.", "moves": [ "Your move: exd5 (popularity: 55.0%, eval: 1.0)", "", "Opponent has 3 good move(s) in this position", "Opponent has a 0.0% chance to commit a mistake", "Opponent has a 0.0% chance to commit a blunder", "Your move: Nxe5 (popularity: 27.1%, eval: 0.7)", "", "Opponent has 3 good move(s) in this position", "Opponent has a 0.0% chance to commit a mistake", "Opponent has a 0.0% chance to commit a blunder", "Your move: d4 (popularity: 6.2%, eval: 0.3)", "", "Opponent has 3 good move(s) in this position", "Opponent has a 0.0% chance to commit a mistake", "Opponent has a 0.0% chance to commit a blunder" ] }'




});
