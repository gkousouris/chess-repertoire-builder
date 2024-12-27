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
          this.moveMenu.show(node, (moveText) => {
            console.log('Move clicked:', moveText);
          });
        }
      },
      true
    );
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