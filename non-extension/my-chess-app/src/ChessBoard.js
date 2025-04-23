import React from 'react';
import Chessboard from 'chessboardjsx';
import chessboardImage from './chess.png';

function ChessBoard() {
  return (
    <div
      style={{
        backgroundImage: `url(${chessboardImage})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        width: '100%',
        paddingTop: '100%',
        position: 'relative',
      }}
    >
      {/* Add any additional components, such as pieces or move indicators, here */}
    </div>  );
}

export default ChessBoard;
