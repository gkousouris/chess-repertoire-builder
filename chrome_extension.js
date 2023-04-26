const repertoire = {
  "e4": {
    "e5": {
      "Bc4": {
        "Nf6": {"d3": {}},
        "c6": {"d3": {}}
      }
    },
    "c5": {"c3": {}}
  }
};


function findFirstDiscrepancy(repertoire, game) {
  let curr_parent = repertoire;
  let index = 0;

  for (let i =0; i<game.length; i++){
    const move = game[i];
    console.log(move);
    const next_parent = curr_parent[move];
    console.log(next_parent);
    if (!next_parent) {
      let message = '';
      if (i % 2 == 0) { // TODO: Make this work for black repertoires
        let move_num = (i + 2) / 2;
        message += 'You played ' + move_num + ". " + move + ', whereas your repertoire has ' + (Object.keys(curr_parent).length > 0 ? 'one of the following moves: ' + Object.keys(curr_parent).join(', ') : 'ended');
      } else {
        message += 'Black played ' + (i + 1) / 2 + ". ..." + move + ', which was not in your repertoire. You should study it.'
      }
      return [i, message]
      break;
    }

    curr_parent = next_parent;
    index = 0;
  }

}


function processPGN(repertoire) {
  const sanElements = document.querySelector('.tview2').getElementsByTagName('san');
  const sanArray = Array.from(sanElements);
  const game_pgn = sanArray.map(sanElement => sanElement.innerHTML);

  x = findFirstDiscrepancy(repertoire, game_pgn);
  console.log(x[0] + x[1])
  alert(x[1])
  for (let i=0; i <= x[0]; i++) {
    sanElements[i].innerHTML += " book"
  }

  sanElements[x[0]+1].innerHTML += " analyzing.."
}

processPGN(repertoire)
