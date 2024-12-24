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

// Try to modify page immediately and also after load, since board may load asynchronously
modifyPage();
window.addEventListener("load", modifyPage);

// Set up periodic check in case board loads very late
const checkInterval = setInterval(() => {
  const siteAdapter = getSiteAdapter();
  if (siteAdapter.getBoardElement()) {
    modifyPage();
    clearInterval(checkInterval);
  }
}, 1000);
