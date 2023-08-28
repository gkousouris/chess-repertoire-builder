// import { getMoves, processPGN } from './logic.js'
if (window.location.href.startsWith("https://lichess.org/")) {
  
        console.log('123')
        let repertoire = {
          "e4": {
            "e5": {}
          }
        };

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
                  newLink.addEventListener("click", function() {
                    const activeMove = document.querySelector('.tview2 .context-menu');
                    getMoves(activeMove);
                    console.log('moves')
                    // Add code to handle the moves array here
                  });
                  node.appendChild(newLink);

                }
              }
            }

          }
        };



        const board = document.getElementsByClassName('analyse__board')[0];
        if (board) {
          let repertoire2 = localStorage.getItem('repertoire');
          if (repertoire2) {
            repertoire = JSON.parse(repertoire2);
          }
          processPGN(repertoire);
          // Create an observer instance that watches for changes to the entire document
          const observer = new MutationObserver(callback);
          observer.observe(document, { childList: true, subtree: true });

        }




      };
;
