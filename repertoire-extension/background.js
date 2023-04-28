// import { getMoves, processPGN } from './logic.js'


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url?.startsWith("chrome://")) return undefined;
  console.log('heyo');
  if (changeInfo.status === 'complete' && tab.active) {

    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: () => {

        function addBookSymbol(move) {
          const innerText = move.innerText;

          if (innerText === ('...')) return;
          if (innerText.includes('\u{1F534}')) {
            move.innerText = innerText.replace(/\u{1F534}/gu, '\u{1F4D6}');
          } else if (!innerText.includes('\u{1F4D6}')) {
            move.innerText = innerText + ' \u{1F4D6}';
          }
        }

        function addBlunderSymbol(move) {
          const innerText = move.innerText;

          if (!innerText.includes('\u{1F534}')) {
            move.innerText = innerText + ' \u{1F534}';
          }
        }



        function remove_unicodes(moves) {
          return moves.map(move => move.replace(/ \p{So}/ug, '').trim());
        }


        function findFirstDiscrepancy(repertoire, game) {
          game = remove_unicodes(game);
          console.log(game);
          let curr_parent = repertoire;
          let index = 0;
          let i;
          for (i =0; i<game.length; i++){
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
          return [i, 'all good'];

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
          console.log(x);
          // alert(x[1])
          for (let i=0; i < x[0]; i++) {
            addBookSymbol(sanElements[i])
          }
          if (sanElements[x[0]]) addBlunderSymbol(sanElements[x[0]])
        }

        // processPGN(repertoire)



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



        function getMoves(activeMove) {
          let move = activeMove;
          let moves = [];

          while (move) {
            if (move.tagName === "MOVE") {
              moves.unshift(move.innerText);
              addBookSymbol(move)
            }
            move = move.previousElementSibling;
          }

          let parent = activeMove.parentElement;
          if (parent) parent = parent.parentElement;

          while (parent) {
            const moveChildren = [];
            let interruptFound = false;

            for (const child of parent.children) {
              if (interruptFound || child === activeMove) break;
              if (child.tagName === 'MOVE') {moveChildren.push(child.innerText); addBookSymbol(child)}
              if (child.tagName === 'INTERRUPT') interruptFound = true;
            }

            moves = [...moveChildren, ...moves];

            if (parent.parentElement && parent.parentElement.className === 'tview2 tview2-column') {
              while (parent) {
                if (parent.tagName === "MOVE") {
                  moves.unshift(parent.innerText);
                  addBookSymbol(parent)
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
          moves = moves.map(move => move.replace(/ \p{So}/ug, ''));



          repertoire = expandRepertoire(moves, repertoire)
          console.log('setting..')
          localStorage.setItem('repertoire', JSON.stringify(repertoire));

        }

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
                  console.log(node);
                  console.log('yoo')
                  const newLink = document.createElement('a');
                  newLink.textContent = 'Add to repertoire';
                  newLink.setAttribute('data-icon', '🎵');
                  newLink.addEventListener("click", function() {
                    const activeMove = document.querySelector('.tview2 .context-menu');
                    getMoves(activeMove);
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
          console.log('yoooo')
          console.log(repertoire["e4"]);
          processPGN(repertoire);
          // Create an observer instance that watches for changes to the entire document
          const observer = new MutationObserver(callback);
          observer.observe(document, { childList: true, subtree: true });

        }




      }
    });
  }
});
