let repertoire = {
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
    const next_parent = curr_parent[move];
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
// pgn: 1. e4 e5 (1... e6 2. d4 d6 (2... c5 3. d5 (3. c4) (3. b3 g6 4. g3 b6 5. Bg2 (5. Bb2 Nf6 (5... Bg7)))) (2... b6))

function processPGN(repertoire) {
  const sanElements = document.querySelector('.tview2').getElementsByTagName('san');
  const sanArray = Array.from(sanElements);
  if (sanArray.length == 0) {
    alert('make some moves first');
    return;
  }
  const game_pgn = sanArray.map(sanElement => sanElement.innerHTML);

  x = findFirstDiscrepancy(repertoire, game_pgn);
  alert(x[1])
  for (let i=0; i < x[0]; i++) {
    sanElements[i].innerHTML += "  \u{1F4D6}";
  }

  sanElements[x[0]].innerHTML +=  "  \u{1F534}"
}

processPGN(repertoire)




console.log(variation);
