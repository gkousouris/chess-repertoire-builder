import { useState } from 'preact/hooks'
import { Pgn } from "../node_modules/cm-pgn/src/Pgn.js"
import { Chess } from 'chess.js'

import preactLogo from './assets/preact.svg'
import viteLogo from '/vite.svg'
import './app.css'

export function App() {

  let data = {
    "e4": {
        "e5": {}
    },
    "Nf3": {
        "d5": {
            "g3": {
                "Nf6": {}
            }
        }
    }
  }



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


  

  const chess = new Pgn()

  traverseObjectWithLatestParent(data, chess, 'start');
  console.log(chess.render());

  const [count, setCount] = useState(0)

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
      <div class="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/app.tsx</code> and save to test HMR
        </p>
      </div>
      <p class="read-the-docs">
        Click on the Vite and Preact logos to learn more
      </p>
    </>
  )
}
