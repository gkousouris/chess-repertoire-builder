class MoveMenu {
  constructor() {
    this.currentMenu = null;
  }
  show(node, onMoveClick) {
    // Remove any existing menu
    this.remove();
    
    // Create menu element
    const menu = document.createElement('div');
    menu.style.position = 'absolute';
    menu.style.backgroundColor = 'white';
    // menu.style.border = '1px solid black';
    menu.style.padding = '5px';
    menu.style.zIndex = '1000';
    
    // Create button
    const button = document.createElement('button');
    button.textContent = 'Add to Repertoire';
    button.onclick = () => {
      onMoveClick(node.textContent);
      this.remove();
    };
    
    // Add button to menu
    menu.appendChild(button);
    
    // Position menu near the node
    const rect = node.getBoundingClientRect();
    const parent = node.closest('.white-move, .black-move');
    if (parent && parent.classList.contains('white-move')) {
      menu.style.left = `${rect.left - 150}px`; // Position far to the left of white moves
    } else {
      menu.style.left = `${rect.right + 10}px`; // Position to the right of black moves
    }
    menu.style.top = `${rect.top}px`; // Align vertically with the node
    // Add menu to document
    document.body.appendChild(menu);
    this.currentMenu = menu;
    
    // Remove menu when clicking outside
    this.closeHandler = (e) => {
      if (!menu.contains(e.target)) {
        this.remove();
      }
    };
    document.addEventListener('click', this.closeHandler);
  }

  remove() {
    if (this.currentMenu) {
      this.currentMenu.remove();
      this.currentMenu = null;
      document.removeEventListener('click', this.closeHandler);
    }
  }
}