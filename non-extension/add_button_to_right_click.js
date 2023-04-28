// Callback function to execute when mutations are observed
const callback = function(mutationsList, observer) {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      const addedNodes = mutation.addedNodes;
      for (const node of addedNodes) {
        if (node.id === 'analyse-cm' && node.classList.contains('visible')) {
          const newLink = document.createElement('a');
          newLink.textContent = 'Add to repertoire';
          newLink.setAttribute('data-icon', '🎵');
          node.appendChild(newLink);
        }
      }
    }
  }
};

// Create an observer instance that watches for changes to the entire document
const observer = new MutationObserver(callback);
observer.observe(document, { childList: true, subtree: true });
