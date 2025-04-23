
import React from 'react';
import './RepertoireInfo.css';

function RepertoireInfo() {
  return (
    <div className="chessboard-text">
      <p>
        The opponent expanded on your repertoire with 4. d6?, (popularity: 8% eval: +1.0).
      </p>
      <p>
       Your response 5. O-O was a mistake (popularity 14%, eval: 0.0).
      </p>
      <p>
        Suggestions for your repertoire:
        <br />
        - Clear best move: 5. Ng5  (popularity: 29%, eval: +1.0)
      </p>
      <p>
      Do you want to add this move to the repertoire?
      </p>
      <div className="update-repertoire">
        <button className="update-repertoire-button">Yes</button>
        <button className="cancel-update-button">No</button>
      </div>
    </div>
  );
}


export default RepertoireInfo;
