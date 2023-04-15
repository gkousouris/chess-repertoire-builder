import {Pgn} from "./cm-pgn/src/cm-pgn/Pgn.js";

function findFirstDiscrepancy(repertoire, game) {
  alert('yo')
  console.log(repertoire, game)
  let curr_parent = repertoire;
  let index = 0;
  for (let i =0; i<game.length; i++){

    if (curr_parent[index].san == game[i].san) {
      index += 1
      continue;
    }
    const sans = curr_parent[index].variations.map(obj => obj[0].san);
    if (sans.includes(game[i].san)) {
      curr_parent = curr_parent[index].variations[sans.indexOf(game[i].san)]
      index = 0;
      continue;
    }
    let message = ''
    if (i % 2 == 0) { // TODO: Make this work for black repertoires
      let move_num = (i + 2) / 2;
      message += 'You played ' + move_num + ". " + game[i].san + ', whereas your repertoire has ' + (curr_parent.length > 0 ? move_num + ". " +curr_parent[index].san : 'ended');
    } else {
      message += 'Black played ' + (i + 1) / 2 + ". ..." + game[i].san + ', which was not in your repertoire. You should study it.'
    }
    document.getElementById('result').innerHTML = message;
    break;
  }
}

let btn = document.querySelector('#show');

btn.addEventListener('click', function () {
  let repertoire = new Pgn(window.parent.document.querySelector('#repertoire').value);
  let game_moves = new Pgn(window.parent.document.querySelector('#game').value);
  findFirstDiscrepancy(repertoire.history.moves, game_moves.history.moves)
});
