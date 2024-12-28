// content.js
console.log("Content script loaded");

function getSiteAdapter() {
  const hostname = window.location.hostname;
  if (hostname.includes('lichess.org')) {
    return new LichessAdapter();
  } else if (hostname.includes('chess.com')) {
    return new ChessComAdapter();
  }
  throw new Error('Unsupported chess platform');
}

function modifyPage() {
  console.log("Modifying page");
  const siteAdapter = getSiteAdapter();
  const board = siteAdapter.getBoardElement();
  console.log('board', board);
  if (board) {
    //1. get the repertoire
    let repertoire = localStorage.getItem('repertoire');
    repertoire = repertoire ? JSON.parse(repertoire) : {"e4": {}};
    console.log('parsed repertoire', repertoire);
    processPGN(repertoire);
    
    // Create an observer instance using site-specific selectors
    const observer = new MutationObserver((mutationsList) => 
      siteAdapter.handleMutations(mutationsList, repertoire)
    );

    // 2. add book emoji to moves
    siteAdapter.markRepertoireMoves(repertoire);
    
    observer.observe(document, { childList: true, subtree: true });
  }
}

// Function to check for board and call modifyPage
function checkBoardAndModify() {
  const siteAdapter = getSiteAdapter();
  if (siteAdapter.getBoardElement()) {
    modifyPage();
    return true;
  }
  return false;
}

// Try to modify page immediately and also after load, since board may load asynchronously
checkBoardAndModify();
window.addEventListener("load", () => checkBoardAndModify());

// Listen for URL changes on chess.com's SPA
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    // Start checking for board after URL change
    const urlChangeInterval = setInterval(() => {
      if (checkBoardAndModify()) {
        clearInterval(urlChangeInterval);
      }
    }, 500);
  }
}).observe(document, {subtree: true, childList: true});

// Set up periodic check in case board loads very late
const checkInterval = setInterval(() => {
  if (checkBoardAndModify()) {
    clearInterval(checkInterval);
  } else {
    console.log('Board not loaded yet');
  }
}, 1000);
