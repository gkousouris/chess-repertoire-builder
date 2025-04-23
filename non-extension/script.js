    import {Pgn} from "./cm-pgn/src/Pgn.js"
    const pgn = new Pgn(`[Site "Berlin"]
[Date "1989.07.02"]
[White "Haack, Stefan"]
[Black "Maier, Karsten"]

1. e4 e5 (e6) 2. Nf3 $1 {Great move!} Nc6 *`)
console.log(pgn)

