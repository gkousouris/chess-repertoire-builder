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
    menu.style.left = `${rect.left}px`;
    menu.style.top = `${rect.bottom}px`;
    
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