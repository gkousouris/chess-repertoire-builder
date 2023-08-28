import { useState } from 'preact/hooks'
import { Pgn } from "cm-pgn/src/Pgn.js"

import preactLogo from './assets/preact.svg'
import viteLogo from '/vite.svg'
import './app.css'

export function App() {


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


  function convertDataToPGN(game_dict) {
    const chess = new Pgn()
    traverseObjectWithLatestParent(game_dict, chess, 'start');
    return chess.render()
  }

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
