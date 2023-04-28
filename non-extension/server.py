from flask import Flask, request
from flask_cors import CORS
from logic import find_first_deviation

app = Flask(__name__)
CORS(app)

@app.route('/evaluateMove', methods=['GET'])
def evaluateMove():
    is_user_white = True
    return find_first_deviation(request.args.get('repertoire'), request.args.get('game_moves'), is_user_white)

if __name__ == '__main__':
    app.run(debug=True)
