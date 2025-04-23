from stockfish import Stockfish
import random
import time
import os
import sys
import requests
import re
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
import json
import chess.pgn

# Find Stockfish in common locations
def find_stockfish():
    stockfish_paths = [
        '/usr/local/bin/stockfish',
        '/usr/bin/stockfish',
        '/usr/games/stockfish',
        'stockfish',
        # Add more common paths if needed
    ]
    
    for path in stockfish_paths:
        if os.path.exists(path):
            print(f"Found Stockfish at: {path}")
            return path
    
    # Try using 'stockfish' directly (it might be in PATH)
    try:
        sf = Stockfish(path="stockfish")
        return "stockfish"
    except Exception:
        pass
        
    print("Warning: Stockfish not found. Using cloud evaluation as fallback.")
    return None

# Initialize stockfish only when needed, not at import time
# This helps with testing and environments where stockfish isn't installed
def get_stockfish():
    global _stockfish
    if '_stockfish' not in globals() or _stockfish is None:
        stockfish_path = find_stockfish()
        if stockfish_path:
            try:
                _stockfish = Stockfish(path=stockfish_path)
                print("Successfully initialized Stockfish engine")
            except Exception as e:
                print(f"Error initializing Stockfish: {e}")
                _stockfish = None
        else:
            _stockfish = None
    return _stockfish

# IMPORT GAMES
def get_moves_from_gameID(gameID):

    r = requests.get("https://lichess.org/game/export/" + gameID + "?tags=false&clocks=false", headers={"accept": "application/x-ndjson"})
    moves = r.content.decode("utf-8").replace("\n", "")

    return moves

def get_fens_from_pgn(pgn_path):

    fens = []
    with open(pgn_path, encoding='utf-8') as h:
        while True:
            game = chess.pgn.read_game(h)
            if game is None:
                break

            game = game.root()
            while game.next():
                game=game.next()
                fens.append(game.board().fen())

    return fens


# STOCKFISH
def engine_cloud_eval(fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR%20w%20KQkq%20-%200%201", multiPv="5", variant="standard"):
    # Starting function to query a particular position with preferred criteria
    # Returns a json from the opening explorer API

    url = "https://lichess.org/api/cloud-eval?variant=" + variant + "&multiPv=" + multiPv + "&fen=" + fen
    r = requests.get(url, headers={"Accept": "application/x-ndjson"})
    r_text = json.loads(r.content.decode("utf-8"))

    return r_text


class TooManyRequestsError(Exception):
    pass

# OPENING EXPLORER
def opening_explorer(fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR%20w%20KQkq%20-%200%201", speeds="blitz,rapid,classical,correspondence", variant="standard", moves="30", ratings="1800,2000,2200,2500"):
    # Starting function to query a particular position with preferred criteria
    # Returns a json from the opening explorer API
    url = "https://explorer.lichess.ovh/lichess?variant=" + variant + "&moves=" + moves + "&speeds=" + speeds + "&ratings=" + ratings + "&fen=" + fen
    r = requests.get(url, headers={"Accept": "application/x-ndjson"})
    if r.status_code == 429:
        print('too many requests')
        raise TooManyRequestsError("Too Many Requests. Wait 1 minute.")
    r_text = json.loads(r.content.decode("utf-8"))
    # time.sleep(1)
    return r_text


def get_total_games_played(opening_explorer_json, from_popularity=0, to_popularity=-1, from_move="", move_system="san"):
    # Returns the denominator of the % likelihood of a move getting played

    # You can use this function to compute the numerator for a single move
    # by adjusting the from_popularity and to_popularity to two consecutive values
    # (e.g. respectively 0 and 1 to get the number of games playing the most popular move)

    # move_system = 'san' (e.g. Nf3) or 'uci' (e.g. g1f3)

    total_games_played = 0

    if from_move != "":
        return [move["white"] + move["draws"] + move["black"] for move in opening_explorer_json["moves"] if move[move_system]==from_move][0]

    for move in opening_explorer_json["moves"][from_popularity:to_popularity]:
        total_games_played += move["white"] + move["draws"] + move["black"]

    return total_games_played


def isOpening(opening_explorer_json):

    total_games_played = 0

    for move in opening_explorer_json["moves"]:
        total_games_played += move["white"] + move["draws"] + move["black"]

    if total_games_played > 5:
        return True

    else:
        return False


# OPPORTUNITY ANALYSIS
def analyse_missed_opportunity_from_fen(starting_fen, following_fen, threshold=100):

    try:
        opportunity_eval = engine_cloud_eval(starting_fen, multiPv="1")["pvs"][0]["cp"]
    except:
        stockfish = get_stockfish()
        stockfish.set_fen_position(starting_fen)
        current_position = stockfish.get_fen_position()
        opportunity_eval = stockfish.get_top_moves(1)[0]["Centipawn"]

    try:
        played_move_eval = engine_cloud_eval(following_fen, multiPv="1")["pvs"][0]["cp"]
    except:
        stockfish = get_stockfish()
        stockfish.set_fen_position(following_fen)
        current_position = stockfish.get_fen_position()
        played_move_eval = stockfish.get_top_moves(1)[0]["Centipawn"]

    diff = opportunity_eval - played_move_eval

    if (opportunity_eval - played_move_eval >= threshold):
        try:
            print("Missed opportunity to play", engine_cloud_eval(starting_fen, multiPv="1")["pvs"][0]["moves"].split(" ")[0], "to gain an advantage of +", round(diff/100,1))
        except:
            stockfish = get_stockfish()
            print("Missed opportunity to play", stockfish.get_top_moves(1)[0]["Move"], "to gain an advantage of +", round(diff/100,1))

    #elif (engine_cloud_eval(following_fen, multiPv="3")["error"] == 'Not found'):
        #print("Outside of opening phase")

    return


def get_mistake_blunder_likelihood_from_fen(fen, mistake_threshold=200, blunder_threshold=500, verbose=False):

    opening_explorer_from_fen = opening_explorer(fen)
    mistake_likelihood = 0
    blunder_likelihood = 0
    good_move = []
    total_games = get_total_games_played(opening_explorer_from_fen, from_popularity=0, to_popularity=-1)
    messages = []
    # Get initial eval
    stockfish = get_stockfish()
    stockfish.set_fen_position(fen)
    current_position = stockfish.get_fen_position()
    current_eval = stockfish.get_top_moves(1)[0]["Centipawn"]

    for move in opening_explorer_from_fen["moves"]:
        # Reinitialise
        mate_eval = None
        stockfish = get_stockfish()
        stockfish.set_fen_position(fen)
        current_position = stockfish.get_fen_position()

        # Fixing issue with castling
        if (move["san"]=='O-O')&(move["uci"]=='e8h8'):
            move["uci"]='e8g8'
        if (move["san"]=="O-O-O")&(move["uci"]=='e8a8'):
            move["uci"]='e8c8'
        if (move["san"]=='O-O')&(move["uci"]=='e1h1'):
            move["uci"]='e1g1'
        if (move["san"]=="O-O-O")&(move["uci"]=='e1a1'):
            move["uci"]='e1c1'

        # Make a move from the Opening Explorer
        stockfish.make_moves_from_current_position([move["uci"]])
        new_position = stockfish.get_fen_position()

        # Handling mates in the eval
        mate_eval = stockfish.get_top_moves(1)[0]["Mate"]
        if mate_eval != None:
            mistake_likelihood += get_total_games_played(opening_explorer_from_fen, from_move=move["uci"], move_system="uci")
            blunder_likelihood += get_total_games_played(opening_explorer_from_fen, from_move=move["uci"], move_system="uci")
            print(move["san"],
                  get_total_games_played(opening_explorer_from_fen, from_move=move["uci"], move_system="uci"),
                  total_games,
                  round(get_total_games_played(opening_explorer_from_fen, from_move=move["uci"], move_system="uci") / total_games, 3),
                  "Mate in", mate_eval)
            continue

        current_eval = stockfish.get_top_moves(1)[0]["Centipawn"]

        # Calculate evaluation difference
        diff = new_eval - current_eval

        # Automatically identifying if we're evaluating black or white
        if fen.split(" ")[1] == 'b':
            if diff <= mistake_threshold * -1:
                mistake_likelihood += get_total_games_played(opening_explorer_from_fen, from_move=move["uci"], move_system="uci")
            if diff <= blunder_threshold * -1:
                blunder_likelihood += get_total_games_played(opening_explorer_from_fen, from_move=move["uci"], move_system="uci")
            if diff > mistake_threshold * -1:
                good_move.append(move)
        else:
            if diff >= mistake_threshold:
                mistake_likelihood += get_total_games_played(opening_explorer_from_fen, from_move=move["uci"], move_system="uci")
            if diff >= blunder_threshold:
                blunder_likelihood += get_total_games_played(opening_explorer_from_fen, from_move=move["uci"], move_system="uci")
            if diff < mistake_threshold:
                good_move.append(move)

        if verbose==True:
            print(move["san"],
                  get_total_games_played(opening_explorer_from_fen, from_move=move["uci"], move_system="uci"),
                  total_games,
                  round(get_total_games_played(opening_explorer_from_fen, from_move=move["uci"], move_system="uci") / total_games, 3),
                  diff
             )

    try:
        print("")
        print("Opponent has", len(good_move), "good move(s) in this position")
        print("Opponent has a", '{:.1%}'.format(mistake_likelihood / total_games), "chance to commit a mistake")
        print("Opponent has a", '{:.1%}'.format(blunder_likelihood / total_games), "chance to commit a blunder")

        messages.append("")
        messages.append("Opponent has " + str(len(good_move)) + " good move(s) in this position")
        messages.append("Opponent has a " + '{:.1%}'.format(mistake_likelihood / total_games) + " chance to commit a mistake")
        messages.append("Opponent has a " + '{:.1%}'.format(blunder_likelihood / total_games) + " chance to commit a blunder")

    except:
        print("Not enough games in Opening Explorer")
        print("")

    return


def get_sharpest_lines_from_fen(fen="rn1qk1nr/pp3pbp/4p1p1/2ppP3/3P4/2N2B1P/PPP2PP1/R1BQK2R w KQkq - 0 9", mistake_threshold=150, blunder_threshold=400, verbose=False, dev_limit=100):
    # Put thresholds negative when analysing white moves
    # and positive when analysing black moves

    opening_explorer_from_fen = opening_explorer(fen)
    total_games = get_total_games_played(opening_explorer_from_fen, from_popularity=0, to_popularity=-1)

    # Get initial eval
    stockfish = get_stockfish()
    stockfish.set_fen_position(fen)
    current_position = stockfish.get_fen_position()
    current_eval = stockfish.get_top_moves(1)[0]["Centipawn"]
    messages = []

    for move in opening_explorer_from_fen["moves"][:dev_limit]:
        # Checking that it has enough games in the Opening Explorer to make stats
        if get_total_games_played(opening_explorer_from_fen, from_move=move["uci"], move_system="uci")>5:

            # Initialise
            mate_eval = None
            mistake_likelihood = 0
            blunder_likelihood = 0
            good_move = []
            stockfish = get_stockfish()
            stockfish.set_fen_position(fen)
            current_position = stockfish.get_fen_position()

            # Fixing issue with castling
            if (move["san"]=='O-O')&(move["uci"]=='e8h8'):
                move["uci"]='e8g8'
            if (move["san"]=="O-O-O")&(move["uci"]=='e8a8'):
                move["uci"]='e8c8'
            if (move["san"]=='O-O')&(move["uci"]=='e1h1'):
                move["uci"]='e1g1'
            if (move["san"]=="O-O-O")&(move["uci"]=='e1a1'):
                move["uci"]='e1c1'

            # Make a move from the Opening Explorer
            stockfish.make_moves_from_current_position([move["uci"]])
            new_position = stockfish.get_fen_position()
            opening_explorer_from_new_fen = opening_explorer(new_position)
            new_total_games = get_total_games_played(opening_explorer_from_new_fen, from_popularity=0, to_popularity=-1)

            # Handling mates in the eval
            mate_eval = stockfish.get_top_moves(1)[0]["Mate"]
            if mate_eval != None:
                mistake_likelihood += get_total_games_played(opening_explorer_from_fen, from_move=move["uci"], move_system="uci")
                blunder_likelihood += get_total_games_played(opening_explorer_from_fen, from_move=move["uci"], move_system="uci")
                print("Your move:", move["san"],
                      "(popularity:", '{:.1%}'.format(round(get_total_games_played(opening_explorer_from_fen,
                                                                                   from_move=move["uci"],
                                                                                   move_system="uci") / total_games, 3)
                                                     ),
                  ", eval:", "mate in", mate_eval, ")")
                print("")
                continue

            # Get intermediate eval
            intermediate_eval = stockfish.get_top_moves(1)[0]["Centipawn"]

            move_str = "Your move: {} (popularity: {:.1%}, eval: {})".format(
                move["san"],
                round(get_total_games_played(opening_explorer_from_fen, from_move=move["uci"], move_system="uci") / total_games, 3),
                round(intermediate_eval/100,1)
            )

            print(move_str)
            messages.append(move_str)

            for new_move in opening_explorer_from_new_fen["moves"][:dev_limit]: # limit the # of lines looked at for dev
                # Reinitialise
                mate_eval = None
                stockfish = get_stockfish()
                stockfish.set_fen_position(new_position)
                new_position = stockfish.get_fen_position()

                # Fixing issue with castling for the new move too
                if (new_move["san"]=='O-O')&(new_move["uci"]=='e8h8'):
                    new_move["uci"]='e8g8'
                if (new_move["san"]=="O-O-O")&(new_move["uci"]=='e8a8'):
                    new_move["uci"]='e8c8'
                if (new_move["san"]=='O-O')&(new_move["uci"]=='e1h1'):
                    new_move["uci"]='e1g1'
                if (new_move["san"]=="O-O-O")&(new_move["uci"]=='e1a1'):
                    new_move["uci"]='e1c1'

                # Play new move
                stockfish.make_moves_from_current_position([new_move["uci"]])
                newest_position = stockfish.get_fen_position()

                # Handling mates in the eval
                mate_eval = stockfish.get_top_moves(1)[0]["Mate"]
                if mate_eval != None:
                    mistake_likelihood += get_total_games_played(opening_explorer_from_new_fen, from_move=new_move["uci"], move_system="uci")
                    blunder_likelihood += get_total_games_played(opening_explorer_from_new_fen, from_move=new_move["uci"], move_system="uci")
                    if verbose==True:
                        print(new_move["san"],
                              get_total_games_played(opening_explorer_from_new_fen, from_move=new_move["uci"], move_system="uci"),
                              total_games,
                              round(get_total_games_played(opening_explorer_from_new_fen, from_move=new_move["uci"], move_system="uci") / total_games, 3),
                              "Mate in", mate_eval)
                    continue

                # Getting new eval
                newest_eval = stockfish.get_top_moves(1)[0]["Centipawn"]
                diff = newest_eval - current_eval

                # Automatically identifying if we're evaluating black or white
                if newest_position.split(" ")[1] == 'b':
                    if diff <= mistake_threshold * -1:
                        mistake_likelihood += get_total_games_played(opening_explorer_from_new_fen, from_move=new_move["uci"], move_system="uci")
                    if diff <= blunder_threshold * -1:
                        blunder_likelihood += get_total_games_played(opening_explorer_from_new_fen, from_move=new_move["uci"], move_system="uci")
                    if diff > mistake_threshold * -1:
                        good_move.append(new_move)
                else:
                    if diff >= mistake_threshold:
                        mistake_likelihood += get_total_games_played(opening_explorer_from_new_fen, from_move=new_move["uci"], move_system="uci")
                    if diff >= blunder_threshold:
                        blunder_likelihood += get_total_games_played(opening_explorer_from_new_fen, from_move=new_move["uci"], move_system="uci")
                    if diff < mistake_threshold:
                        good_move.append(new_move)

                if verbose==True:
                    print("New move:", new_move["san"])
                    print(move["san"],
                          get_total_games_played(opening_explorer_from_new_fen, from_move=new_move["uci"], move_system="uci"),
                          new_total_games,
                          round(get_total_games_played(opening_explorer_from_new_fen, from_move=new_move["uci"], move_system="uci") / new_total_games, 3),
                          diff
                     )

        # Move is not popular enough in the Opening Explorer, go to next move
        else:
            continue

        try:
            print("Opponent has", len(good_move), "good move(s) in this position")
            print("Opponent has a", '{:.1%}'.format(mistake_likelihood / new_total_games), "chance to commit a mistake")
            print("Opponent has a", '{:.1%}'.format(blunder_likelihood / new_total_games), "chance to commit a blunder")
            print("")

            messages.append("Opponent has " + str(len(good_move)) + " good move(s) in this position")
            messages.append("Opponent has a " + '{:.1%}'.format(mistake_likelihood / total_games) + " chance to commit a mistake")
            messages.append("Opponent has a " + '{:.1%}'.format(blunder_likelihood / total_games) + " chance to commit a blunder")
            messages.append("")
        except:
            print("Not enough games in Opening Explorer")
            print("")

    return messages
