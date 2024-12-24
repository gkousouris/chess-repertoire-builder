// const { addBookSymbol, expandRepertoire } = require('../helper-functions.js');


class LichessAdapter {
  constructor() {
    this.repertoire = {};
  }

  getBoardElement() {
    return document.getElementsByClassName('analyse__board')[0];
  }

  handleMutations(mutationsList, repertoire) {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.id === 'analyse-cm' && node.classList.contains('visible')) {
            this.addRepertoireButton(node);
          }
        }
      }
    }
  }

  addRepertoireButton(contextMenu) {
    const newLink = document.createElement('a');
    newLink.textContent = 'Add to repertoire';
    newLink.setAttribute('data-icon', '🎵');
    newLink.addEventListener("click", () => {
      const activeMove = document.querySelector('.tview2 .context-menu');
      console.log(activeMove)
      this.getMoves(activeMove);
      console.log('moves');
    });
    contextMenu.appendChild(newLink);
  }

  markRepertoireMoves(repertoire) {
    this.repertoire = repertoire;
    const moveElements = document.querySelector('.tview2-column');
    if (!moveElements) return [];

    const moves = [];
    const sanElements = moveElements.querySelectorAll('move san');
    
    let currentPosition = repertoire;
    let lastCommonIndex = -1;

    for (let i = 0; i < sanElements.length; i++) {
      const sanElement = sanElements[i];
      const move = sanElement.textContent;
      moves.push(move);
      
      // Check if move exists in repertoire
      if (currentPosition && currentPosition[move]) {
        lastCommonIndex = i;
        currentPosition = currentPosition[move];
        
        // Add book emoji before the eval tag if it exists
        const moveParent = sanElement.parentNode;
        const evalTag = moveParent.querySelector('eval');
        
        // Check if emoji already exists by looking at all spans
        const hasEmoji = Array.from(moveParent.getElementsByTagName('span'))
          .some(span => span.textContent.includes('📖'));
        
        if (!hasEmoji) {
          const emojiSpan = document.createElement('span');
          emojiSpan.textContent = '  📖';
          
          if (evalTag) {
            moveParent.insertBefore(emojiSpan, evalTag);
          } else {
            moveParent.appendChild(emojiSpan);
          }
        }
      } else {
        break;
      }
    }

    const isBlack = (lastCommonIndex + 1) % 2 === 1;
    return { moves, lastCommonIndex, isBlack };
  }

  getMoves(activeMove) {
    let move = activeMove;
    let moves = [];
  
    while (move) {
      if (move.tagName === "MOVE") {
        moves.unshift(move.innerText);
      }
      move = move.previousElementSibling;
    }
  
    let parent = activeMove.parentElement;
    // Skip line element if present
    if (parent && parent.tagName === 'LINE') {
      parent = parent.parentElement;
    }
    if (parent) parent = parent.parentElement;
  
    while (parent) {
      const moveChildren = [];
      let interruptFound = false;
  
      for (const child of parent.children) {
        if (interruptFound || child === activeMove) break;
        if (child.tagName === 'MOVE') {
          moveChildren.push(child.innerText);
        }
        if (child.tagName === 'INTERRUPT') interruptFound = true;
      }
  
      moves = [...moveChildren, ...moves];
  
      if (parent.parentElement && parent.parentElement.className === 'tview2 tview2-column') {
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
    // --
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
    moves = moves.map(move => move.replace(/\s+.*$/, ''));
  
    this.repertoire = expandRepertoire(moves, this.repertoire)
    console.log('setting..')
    localStorage.setItem('repertoire', JSON.stringify(this.repertoire));
  }
}