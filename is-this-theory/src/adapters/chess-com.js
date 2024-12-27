class ChessComAdapter {
  constructor() {
    this.repertoire = {};
    this.moveMenu = new MoveMenu();
    console.log('ChessComAdapter initialized');
    
    // Add click listener for nodes
    document.addEventListener(
      'click',
      (e) => {
        const node = e.target.closest('.node-highlight-content');
        if (node) {
          const clickedNodeId = node.closest('[data-node]').getAttribute('data-node');
          this.moveMenu.show(node, (moveText) => {
            // Get all elements with data-node attribute
            const nodeElements = document.querySelectorAll('[data-node]');
            const moves = [];
            const nodeIds = [];
            
            // First collect all moves and node IDs up to clicked node
            for (const element of nodeElements) {
              const nodeId = element.getAttribute('data-node');
              const firstSpan = element.querySelector('span');
              const moveText = firstSpan?.innerText.split(' ')[0];
              
              if (moveText) {
                moves.push(moveText);
                nodeIds.push(nodeId);
              }

              // Stop when we reach the clicked node
              if (nodeId === clickedNodeId) {
                moves.push(moveText); // Include the clicked node's move
                nodeIds.push(nodeId); // Include the clicked node's ID
                break;
              }
            }

            this.logMoveData(nodeIds, moves);
          });
        }
      },
      true
    );
  }


  logMoveData(nodeIds, moves) {
    // Start from the last node ID and work backwards
    const filteredNodeIds = [];
    const filteredMoves = [];
    
    let currentFirstNum = Infinity;
    
    // Process in reverse order
    for (let i = nodeIds.length - 1; i >= 0; i--) {
      const nodeId = nodeIds[i];
      const firstNum = parseInt(nodeId.split('-')[0]);
      
      if (firstNum < currentFirstNum) {
        // Found a smaller first number, just update current
        currentFirstNum = firstNum;
      } else if (firstNum === currentFirstNum) {
        // Same first number, add to filtered list
        filteredNodeIds.unshift(nodeId);
        filteredMoves.unshift(moves[i]);
      }
      // Ignore if first number is larger
    }
    
    console.log('Filtered Node IDs:', filteredNodeIds);
    console.log('Corresponding Moves:', filteredMoves);

    // Add book emoji to each filtered node
    filteredNodeIds.forEach(nodeId => {
      const element = document.querySelector(`[data-node="${nodeId}"]`);
      if (element) {
        const span = element.querySelector('span');
        if (span && !span.textContent.includes('📖')) {
          span.appendChild(document.createTextNode(' 📖'));
        }
      }
    });

    this.repertoire = expandRepertoire(filteredMoves, this.repertoire)
    console.log('setting..')
    localStorage.setItem('repertoire', JSON.stringify(this.repertoire));
  }

  getBoardElement() {
    // Chess.com specific board element selector
    return document.querySelector('.cc-switch-button');
  }

  handleMutations(mutationsList, repertoire) {
    // Chess.com specific mutation handling
  }

  addRepertoireButton(contextMenu) {
    // Chess.com specific button addition
  }

  getMoves(activeMove) {
    // Chess.com specific move extraction logic
  }

  markRepertoireMoves(repertoire) {
    this.repertoire = repertoire;
    const moveElements = document.querySelectorAll('.node');
    if (!moveElements.length) return [];

    const moves = [];
    let currentPosition = repertoire;
    let lastCommonIndex = -1;

    for (let i = 0; i < moveElements.length; i++) {
      const moveElement = moveElements[i];
      const moveSpan = moveElement.querySelector('.node-highlight-content');
      if (!moveSpan) continue;

      const move = moveSpan.textContent.trim();
      moves.push(move);
      
      // Check if move exists in repertoire
      if (currentPosition && currentPosition[move]) {
        lastCommonIndex = i;
        currentPosition = currentPosition[move];
        
        // Check if emoji already exists
        if (!moveSpan.textContent.includes('📖')) {
          // Create and append text node instead of directly setting textContent
          const bookEmoji = document.createTextNode(' 📖');
          moveSpan.appendChild(bookEmoji);
        }
      } else {
        break;
      }
    }

    const isBlack = (lastCommonIndex + 1) % 2 === 1;
    return { moves, lastCommonIndex, isBlack };
  }
}