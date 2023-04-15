import {Pgn} from "./node_modules/cm-pgn/src/cm-pgn/Pgn.js"

let btn = document.querySelector('#show');
let repertoire = new Pgn(document.querySelector('#repertoire').value);
let game_moves = new Pgn(document.querySelector('#game').value);

function findFirstDiscrepancy(repertoire, game) {
  let curr_parent = repertoire;
  let index = 0;
  for (let i =0; i<game.length; i++){

    if (curr_parent[index].san == game[i].san) {
      index += 1
      continue;
    }
    console.log(curr_parent[index])
    const sans = curr_parent[index].variations.map(obj => obj.san);
    if (sans.includes(game[i].san)) {
      curr_parent = curr_parent[index].variations[sans.indexOf(game[i].san)]
      index = 0;
      continue;
    }
    let message = ''
    if (i % 2 == 0) { // TODO: Make this work for black repertoires
      message += 'You played ' + (i + 2) / 2 + ". " + game[i].san + ', whereas your repertoire has ' + (curr_parent.length > 0 ? curr_parent[index].san : 'nothing');
    } else {
      message += 'Black played ' + (i + 1) / 2 + ". ..." + game[i].san + ', which was not in your repertoire. Add it'
    }
    document.getElementById('result').innerHTML = message;
    break;
  }

    console.log(repertoire, game)
}

btn.addEventListener('click', function () {
  console.log(findFirstDiscrepancy(repertoire.history.moves, game_moves.history.moves));
});
