import { useState } from 'preact/hooks'
import { Pgn } from "cm-pgn/src/Pgn.js"

import preactLogo from './assets/preact.svg'
import viteLogo from '/vite.svg'
import './app.css'

export function App() {
  console.log('---');

  function traverseObjectWithLatestParent(object, chess, latestParent = null) {
    for (const key in object) {
      console.log(key, latestParent)
      let move = chess.history.addMove(key, latestParent)  
      if (object.hasOwnProperty(key)) {
        const value = object[key];
        if (typeof value === 'object' && Object.keys(value).length > 0) {
          traverseObjectWithLatestParent(value, chess, move);
        }
      }
    }
  }


  function addMoveToTree(tree, moves) {
    if (moves.length === 0) {
        return;
    }

    const move = moves[0]; // Get the first move

    if (!tree[move.san]) {
        tree[move.san] = {};
    }

    addMoveToTree(tree[move.san], moves.slice(1));
}

function processVariations(tree, variations) {
    for (const move of variations) {
        console.log(move)
        if (move.variations.length) {
            tree[move.san] = {};
            processVariations(tree[move.san], move.variations);
        } else {
            addMoveToTree(tree, move.san);
        }
    
}

  function convertPGNToData(pgn_text) {
    const chess = new Pgn(pgn_text)
    
    const tree = {};

    for (const moveInfo of chess.history.moves) {
        if (moveInfo.variations.length) {
            processVariations(tree, moveInfo.variations);
        } else {
            addMoveToTree(tree, moveInfo.san);
        }
    }
    console.log('answer:')
    console.log(tree);

    return tree
  }

  function convertDataToPGN(game_dict) {
    const chess = new Pgn()
    traverseObjectWithLatestParent(game_dict, chess, 'start');
    return chess.render()
  }

  let game = {
    "e4": {"e5": {}}
  }

  let pgn = '1. e4 d6 2. d4 Nf6 3. f3 e5 { [%cal Gd4d5,Gd4e5] } 4. dxe5 (4. d5 c6 5. c4 Be7 6. Nc3 O-O 7. Be3) 4... dxe5 5. Qxd8+ Kxd8 6. Bc4 Ke8 7. Be3 Nbd7 8. Nc3'

  // convertDataToPGN(game)
  convertPGNToData(pgn)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} class="logo" alt="Vite logo" />
        </a>
        <a href="https://preactjs.com" target="_blank">
          <img src={preactLogo} class="logo preact" alt="Preact logo" />
        </a>
      </div>
      <h1>Vite + Preact</h1>
      <p class="read-the-docs">
        Click on the Vite and Preact logos to learn more
      </p>
    </>
  )
}
