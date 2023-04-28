import io
import chess.pgn
from utils import get_sharpest_lines_from_fen

def get_san(node, move):
    return node.board().san(move)

# TODO: Be able to infer is_user_white in the future from repertoire / get request.
def find_first_deviation(repertoire, game, is_user_white):
    repertoire = chess.pgn.read_game(io.StringIO(repertoire))
    game = chess.pgn.read_game(io.StringIO(game))



    def opponent_deviated(game_node):
        is_white_turn = game_node.turn()
        return is_white_turn if is_user_white else not is_white_turn

    repertoire_node = repertoire
    game_node = game

    shared_moves = []

    while game_node.variations:
        next_moves = [variation.move for variation in repertoire_node.variations]
        if game_node.variations[0].move not in next_moves:
            break
        shared_moves.append(get_san(game_node, game_node.variations[0].move))
        repertoire_node = repertoire_node.variations[next_moves.index(game_node.variations[0].move)]
        game_node = game_node.variations[0]

    if opponent_deviated(game_node): # either white deviated or theory ran out.
        if not next_moves:
            fen = game_node.board().fen()
            print(fen)
            messages = get_sharpest_lines_from_fen(fen=fen, mistake_threshold=150, blunder_threshold=400, verbose=False, dev_limit=2)
            return {'moves': messages, 'message': 'Prep ran out, you played ' + get_san(game_node, game_node.variations[0].move) + ', novelty.'}
        else:
            return {'message': 'Blunder, you should have played ' + get_san(game_node, next_moves[0]) + ' according to your prep.'}
    else:
        # need to make opponent's move and then grab the FEN
        fen = game_node.variations[0].board().fen()
        print(fen)
        messages = get_sharpest_lines_from_fen(fen=fen, mistake_threshold=150, blunder_threshold=400, verbose=False, dev_limit=3)
        return {'moves': messages, 'message': 'Opponent played ' + get_san(game_node, game_node.variations[0].move) + ' deviating from your prep.'}

def testcases():
    repertoire = '1. e4 e5 (1... d5 2. exd5) 2. Nf3 Nc6'
    game = '1. e4 e5 2. Nf3 Nc6 3. Bc4 b5'
    assert find_first_deviation(repertoire, game, True)['message'] == 'Prep ran out, you played Bc4, novelty.', find_first_deviation(repertoire, game, True)

    repertoire = '1. e4 e5 (1... d5 2. exd5) 2. Nf3 Nc6'
    game = '1. e4 e5 2. Na3 Nc6 3. b4 b5'
    assert find_first_deviation(repertoire, game, True)['message'] == 'Blunder, you should have played Nf3 according to your prep.', find_first_deviation(repertoire, game, True)

    repertoire = '1. e4 e5 (1... d5 2. exd5) 2. Nf3 Nc6'
    game = '1. e4 e5 2. Nf3 a5 3.a4 b5'
    assert find_first_deviation(repertoire, game, True)['message'] == 'Opponent played a5 deviating from your prep.', find_first_deviation(repertoire, game, True)

    repertoire = '1. e4 (1. d4 e5) e5 2. Nf3 Nc6'
    game = '1. e4 e5 2. Nf3 Nc6 3. Bc4 b5'
    assert find_first_deviation(repertoire, game, False)['message'] == 'Opponent played Bc4 deviating from your prep.', find_first_deviation(repertoire, game, False)

    repertoire = '1. e4 (1. d4 e5) e5 2. Nf3 Nc6'
    game = '1. e4 c5 2. Na3 Nc6 3. b4 b5'
    assert find_first_deviation(repertoire, game, False)['message'] == 'Blunder, you should have played e5 according to your prep.', find_first_deviation(repertoire, game, False)

    repertoire = '1. e4 (1. d4 e5 2. dxe5) e5 2. Nf3 Nc6'
    game = '1. d4 e5 2. dxe5 Nf6 a4 b5'
    assert find_first_deviation(repertoire, game, False)['message'] == 'Prep ran out, you played Nf6, novelty.', find_first_deviation(repertoire, game, False)

# testcases()
