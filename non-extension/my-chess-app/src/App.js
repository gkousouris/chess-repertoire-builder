import React from 'react';
import ChessBoard from './ChessBoard';
import MoveTracker from './MoveTracker';
import Menu from './Menu';
import './App.css';
import RepertoireInfo from './RepertoireInfo';

function App() {
  return (
    <div className="app">
      <div className="move-tracker-container">
        <MoveTracker />
      </div>
      <div className="chessboard-container">
        <ChessBoard />
        <RepertoireInfo />

      </div>
      <div className="menu-container">
        <Menu />
      </div>
    </div>
  );
}

export default App;
