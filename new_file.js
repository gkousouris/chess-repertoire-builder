// chat gpt

const activeMove = document.querySelector('.tview2 .context-menu');

// Collect all previous moves
let move = activeMove;
let moves = [];

while (move) {
  if (move.tagName === "MOVE") {
    moves.unshift(move.innerText);
  }
  move = move.previousElementSibling;
}

// Traverse up the tree to find the whole variation
let parent = activeMove.parentElement;
if (parent) parent = parent.parentElement;
console.log(parent);
const variation = [];
while (parent) {
  console.log(parent.className)
  if (parent.className === 'tview2 tview2-column') {
    break;
  }


  //
  const moveChildren = [];
  let interruptFound = false;

  for (const child of parent.children) {
    if (interruptFound || child === activeMove) break;
    if (child.tagName === 'MOVE') moveChildren.push(child.innerText);
    if (child.tagName === 'INTERRUPT') interruptFound = true;
  }

  moves = [...moveChildren, ...moves];

  if (parent.parentElement.className === 'tview2 tview2-column') {

    while (parent) {

      if (parent.tagName === "MOVE") {
        moves.unshift(parent.innerText);
      }
      parent = parent.previousElementSibling;
    }
    break;
  } else {
    parent = parent.parentElement;
  }
}



for (let i = 1; i < moves.length; i++) {
  if (/^\d+\.\.\./.test(moves[i]) && !/^\d+/.test(moves[i - 1])) {
    moves.splice(i - 1, 1);
    i--;
  }
}

for (let i = 1; i < moves.length; i++) {
  const currentMove = moves[i];
  const prevMove = moves[i - 1];

  if (currentMove === '...' && prevMove === '...') {
    moves.splice(i, 1);
    moves.splice(i - 1, 1);
    i -= 2;
  } else if (currentMove === '...' && i < moves.length - 1 && moves[i + 1] !== '...') {
    moves.splice(i, 1);
    moves.splice(i - 1, 1);
    i -= 2;
  }
}

moves = moves.map(item => item.replace(/^\d+\.+/, ''));

console.log(moves)
