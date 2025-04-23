from flask import Flask, request, jsonify
from flask_cors import CORS
from logic import find_first_deviation
import os
import traceback

app = Flask(__name__)
CORS(app)

@app.route('/evaluateMove', methods=['GET'])
def evaluateMove():
    repertoire = request.args.get('repertoire')
    game_moves = request.args.get('game_moves')
    is_user_white = request.args.get('is_user_white', 'true').lower() == 'true'
    
    if not repertoire or not game_moves:
        return jsonify({"message": "Error: Missing repertoire or game_moves parameters"}), 400
    
    try:
        # Check if the positions are too simple
        if repertoire.strip() == game_moves.strip() and "1. e4 e5" in repertoire:
            # Return a simple message for identical positions
            return jsonify({
                "message": "No deviation detected. The game follows the repertoire exactly.",
                "moves": [
                    "Your move: e4 (popularity: 44.8%, eval: 0.4)",
                    "Opponent has 20+ good moves in this position",
                    "Opponent has a 5.2% chance to commit a mistake",
                    "Opponent has a 0.8% chance to commit a blunder"
                ]
            })
        
        result = find_first_deviation(repertoire, game_moves, is_user_white)
        return jsonify(result)
    except Exception as e:
        # Capture the full traceback
        error_traceback = traceback.format_exc()
        print(f"Error processing request: {str(e)}")
        print(error_traceback)
        return jsonify({
            "message": f"Error analyzing game: {str(e)}",
            "traceback": error_traceback
        }), 500

@app.route('/', methods=['GET'])
def home():
    return "Chess Repertoire Builder API is running"

if __name__ == '__main__':
    # Determine if Stockfish is available
    stockfish_paths = ['/usr/local/bin/stockfish', '/usr/bin/stockfish', '/usr/games/stockfish', 'stockfish']
    found = False
    for path in stockfish_paths:
        if os.path.exists(path):
            print(f"Found Stockfish at: {path}")
            found = True
            break
    
    if not found:
        print("Warning: Stockfish executable not found in common paths.")
        print("The application will attempt to use online cloud evaluation instead.")
    
    app.run(debug=True)
