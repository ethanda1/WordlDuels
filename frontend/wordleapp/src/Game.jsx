import React, {useState, useEffect, useMemo} from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Game.css';
import words from '../words.json'

function Game({sock, username, userUpdateColor, colorArray, users, word, uuid, roomCode, winner, gameEnding, isHost, gameStarted}) {
  const [round, setRound] = useState(1);
  const [hasWon, sethasWon] = useState(false);
  const [spellCheck, setspellCheck] = useState(-1);
  const [opponentBoards, setOpponentBoards] = useState({});
  const navigate = useNavigate();

  console.log('haswon' + hasWon);
  console.log(word);

useEffect(() => {
  if (hasWon) {
    sock.send(
      JSON.stringify({
        type: 'game_end',
        uuid: uuid,
        roomcode: roomCode
      })
    );
  }
}, [hasWon]);



  useEffect(()=> {
        if (!gameStarted){
            navigate(`/${roomCode}`);
        }
    }, [gameStarted])

  // Initialize opponent boards when users change
  useEffect(() => {
    if (gameStarted) {
      const newBoards = {};
      Object.keys(users).forEach(userUuid => {
        if (userUuid !== uuid) {
          newBoards[userUuid] = {
            username: users[userUuid],
            rows: []
          };
        }
      });
      setOpponentBoards(newBoards);
    }
  }, [gameStarted, users, uuid]);

  // Update opponent boards when color updates come in
  useEffect(() => {
    if (userUpdateColor && colorArray && userUpdateColor !== uuid) {
      setOpponentBoards(prev => ({
        ...prev,
        [userUpdateColor]: {
          ...prev[userUpdateColor],
          rows: [...(prev[userUpdateColor]?.rows || []), colorArray]
        }
      }));
    }
}, [userUpdateColor, colorArray, uuid]);

  const updateRound = () => {
    setRound(round => round + 1)
  }

  const updateGameState = () => sethasWon(true);

  
  const updateSpellCheck = (boolean) => {
    setspellCheck(boolean);
  }
  
  const handlePlayAgain = () => {
    sock.send(
      JSON.stringify({
        type: 'play-again',
        roomcode: roomCode
    }))

    sethasWon(false);
    setRound(1);
  }

  console.log(spellCheck)

  return (
    <div className="game-container">
      {/* Player Name - Top Left */}
      <div className="player-info">{username}</div>
    <div className='board-container'>
      {/* Opponents Section */}
      <div className="opponents-section">
        {Object.keys(opponentBoards).length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>Waiting for opponents...</p>
          </div>
        ) : (
         <div className="opponents-container">
            {Object.keys(opponentBoards).map(userUuid => (
              winner === userUuid ? (  
              <OpponentBoard 
                  key={userUuid}
                  username={opponentBoards[userUuid].username}
                  rows={opponentBoards[userUuid].rows}
                  hasWon={true}
                />) : (
                <OpponentBoard 
                  key={userUuid}
                  username={opponentBoards[userUuid].username}
                  rows={opponentBoards[userUuid].rows}
                  hasWon={false}
                />
              )
            ))}
          </div>
        )}
      </div>

      {/* Main Game Section */}
      <div className="game-main">
        <div className="game-status">
          {(uuid === winner) && (
            <div className="win-message">
              You won!
            </div>
          )}

          {spellCheck === 0 && (
            <div className="spell-check-error">Not in word list</div>
          )}

          {round === 7 && (!hasWon) && (
            <div className="game-over-message">You lost</div>
          )}

          {gameEnding && !(uuid === winner)  && (
            <div className="game-over-message"> {users[winner]} won. The word was "{word}"</div>
          )}


        </div>

        <div className="game-board">
          <Row key={1} uuid={uuid} sock={sock} roomCode={roomCode} isActive={1 === round} round={updateRound} answer={word} updateGameState={updateGameState} sethasWon={sethasWon} hasWon={hasWon} updateSpellCheck={updateSpellCheck} rowIndex={1} gameEnding = {gameEnding}/>
          <Row key={2} uuid={uuid} sock={sock} roomCode={roomCode} isActive={2 === round} round={updateRound} answer={word} updateGameState={updateGameState} sethasWon={sethasWon} hasWon={hasWon} updateSpellCheck={updateSpellCheck} rowIndex={2} gameEnding = {gameEnding}/>
          <Row key={3} uuid={uuid} sock={sock} roomCode={roomCode} isActive={3 === round} round={updateRound} answer={word} updateGameState={updateGameState} sethasWon={sethasWon} hasWon={hasWon} updateSpellCheck={updateSpellCheck} rowIndex={3} gameEnding = {gameEnding}/>
          <Row key={4} uuid={uuid} sock={sock} roomCode={roomCode} isActive={4 === round} round={updateRound} answer={word} updateGameState={updateGameState} sethasWon={sethasWon} hasWon={hasWon} updateSpellCheck={updateSpellCheck} rowIndex={4} gameEnding = {gameEnding}/>
          <Row key={5} uuid={uuid} sock={sock} roomCode={roomCode} isActive={5 === round} round={updateRound} answer={word} updateGameState={updateGameState} sethasWon={sethasWon} hasWon={hasWon} updateSpellCheck={updateSpellCheck} rowIndex={5} gameEnding = {gameEnding}/>
          <Row key={6} uuid={uuid} sock={sock} roomCode={roomCode} isActive={6 === round} round={updateRound} answer={word} updateGameState={updateGameState} sethasWon={sethasWon} hasWon={hasWon} updateSpellCheck={updateSpellCheck} rowIndex={6} gameEnding = {gameEnding}/>
        </div>


        
      </div>
      </div>
      
           {isHost && gameEnding &&(
            <div className = 'play-again-container'>  
              <button 
                className='play-again'
                onClick={handlePlayAgain}
              >
                Play Again
              </button>
            </div>

          
        )}
        
    </div>
  )
}



function OpponentBoard({username, rows, hasWon}) {
  const emptyRow = ['empty', 'empty', 'empty', 'empty', 'empty'];
  
  // Create 6 rows total, fill with completed rows first, then empty rows
  const displayRows = [];
  for (let i = 0; i < 6; i++) {
    displayRows.push(rows[i] || emptyRow);
  }
  console.log(displayRows);

  return (
    <div className={`opponent-board ${hasWon ? 'has-won' : ''}`}>
      <div className="opponent-username">
        {username}
      </div>
      {displayRows.map((row, index) => (
        <div key={index} className="opponent-row">
          {row.map((color, squareIndex) => (
            <div
              key={squareIndex}
              className={`opponent-square ${color}`}
            >
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function Square({value, colorArray}) {
  return (
    value.map((item, index) => {
      if (colorArray[index] === 'green'){
        return (
          <div className="square-green" key={index}>
            {item}
          </div>
        )
      }
      else if (colorArray[index] === 'yellow'){
        return(
          <div className="square-yellow" key={index}>
            {item}
          </div>
        )
      }
      else if (colorArray[index] === 'gray'){
        return(
          <div className="square-gray" key={index}>
            {item}
          </div>
        )
      }
      else if (colorArray[index] === 'empty'){
        return(
          <div className="square" key={index}>
            {item}
          </div>
        )
      }
    })
  );
}






function Row({isActive, roomCode, uuid, sock, round, answer, updateGameState, hasWon, sethasWon, updateSpellCheck, rowIndex, gameEnding}) {
  const [value, setValue] = useState(['', '', '', '', '']);
  const [index, setIndex] = useState(0); // current input index
  const answerArray= answer.toUpperCase().split('');
  const [colorArray, setcolorArray] = useState(['empty', 'empty', 'empty', 'empty' ,'empty'])

  const answerLetterMap = useMemo(() => {
    const map = {};
    for (let i = 0; i < answerArray.length; i++) {
      if (!(answerArray[i] in map)) {
        map[answerArray[i]] = [i];
      } else {
        map[answerArray[i]].push(i);
      }
    }
    return map;
  }, [answerArray]);

  useEffect(() => {
    if (!isActive){
      return;
    }
    
    const handleKeyDown = (e) => {
      const letter = e.key.toUpperCase();
      if (letter.match(/^[A-Z]$/) && index < 5) {
        const newValue = [...value];
        newValue[index] = letter;
        setValue(newValue);
        setIndex(index + 1);
      }
      if (e.key === 'Backspace' && index > 0) {
        const newValue = [...value];
        newValue[index - 1] = '';
        setValue(newValue);
        setIndex(index - 1);
      }
      
      const isAWord = words.includes(value.join('').toLowerCase());
      if (e.key === 'Enter' && index === 5 && !isAWord){
          updateSpellCheck(0);
        }

      if(e.key === 'Enter' && index === 5 && isAWord){
        updateSpellCheck(1);
        const newColorArray = ['empty', 'empty', 'empty', 'empty', 'empty']
        const copy = JSON.parse(JSON.stringify(answerLetterMap)); 
        // work with copy instead of trying to reset answerLetterMap

        for (let i = 0; i < 5; i++) {
          if (value[i] in copy) {
            for (let j = 0; j < copy[value[i]].length; j++) {
              if (copy[value[i]][j] === i) {
                copy[value[i]].splice(j, 1);
                newColorArray[i] = 'green';
                break;
              }
            }
          }
        }
        for (let i = 0; i < 5; i++) {
          const letter = value[i];
          if (newColorArray[i] === 'empty' && copy[letter] && copy[letter].length > 0) {
            newColorArray[i] = 'yellow';
            copy[letter].splice(0, 1);
          }
        }

        for (let i = 0; i < 5; i++) {
          if (newColorArray[i] === 'empty'){
            newColorArray[i] = 'gray';
          }
        }
        
        console.log('sending'+ newColorArray + 'from user: ' + uuid)
        //sending colors to backend
        sock.send(
          JSON.stringify({
            type: 'square_colors',
            colors: newColorArray,
            uuid: uuid,
            roomcode: roomCode
          })
        );

        setcolorArray(newColorArray);
        //todo: backend stuff
        if (newColorArray.every(color => color === 'green')) {
          updateGameState(true);
        }
        round();
      }
    };
    

    if (!gameEnding){
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }

  }, [value, index, isActive, gameEnding]);

  return(
    <div className="square_single_row" style={{'--row-index': rowIndex}}>
      <Square value={value} colorArray={colorArray}/>
    </div>
  );
}

export default Game