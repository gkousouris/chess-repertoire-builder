function processPGN(moves) {
  console.log('processPGN', JSON.stringify(moves));
}

function addBookSymbol(move) {
  // Skip if move is '...'
  if (move.innerText === '...') return;

  // Find the san element and its parent
  const sanElement = move.querySelector('san');
  const moveParent = sanElement || move;
  const evalTag = moveParent.querySelector('eval');

  // Check if emoji already exists in any child spans
  const hasEmoji = Array.from(moveParent.getElementsByTagName('span'))
    .some(span => span.textContent.includes('📖'));

  // Only add if emoji isn't already present
  if (!hasEmoji) {
    const emojiSpan = document.createElement('span');
    emojiSpan.textContent = '  📖';
    
    if (evalTag) {
      moveParent.insertBefore(emojiSpan, evalTag);
    } else {
      moveParent.appendChild(emojiSpan);
    }
  }
}

function expandRepertoire(game, repertoire) {
  let currentRepertoire = repertoire;
  for (let i = 0; i < game.length; i++) {
    let move = game[i];
    if (currentRepertoire.hasOwnProperty(move)) {
      currentRepertoire = currentRepertoire[move];
    } else {
      currentRepertoire[move] = {};
      currentRepertoire = currentRepertoire[move];
    }
  }
  return repertoire;
}

function findCommonMoves(moves, repertoire) {
  console.log('moves', JSON.stringify(moves));
  console.log('repertoire:', JSON.stringify(repertoire));

  let currentPosition = repertoire;
  let lastCommonIndex = -1;
  
  // Iterate through moves array
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    // Check if current move exists in repertoire
    if (currentPosition[move]) {
      lastCommonIndex = i;
      currentPosition = currentPosition[move];
    } else {
      break;
    }
  }

  // Calculate if we're on black's move based on lastCommonIndex
  const isBlack = (lastCommonIndex + 1) % 2 === 1;
  
  return {
    lastCommonIndex,
    isBlack
  };
}

