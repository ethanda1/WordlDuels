import React, {useState, useEffect, useMemo} from 'react';
import './App.css'
import words from '../words.json'

function Game({sock, username, userUpdateColor, colorArray, users, word, uuid, roomCode}) {
  const [round, setRound] = useState(1);
  const [hasWon, sethasWon] = useState(false);
  const [spellCheck, setspellCheck] = useState(-1);
  const [opponentBoards, setOpponentBoards] = useState({});

  console.log(word);
  console.log(users);
  console.log('updating colors...: '+ colorArray+ 'for user: ' +userUpdateColor);

  // Initialize opponent boards when users change
  useEffect(() => {
    const newBoards = {};
    Object.keys(users).forEach(userUuid => {
      if (userUuid !== uuid) { // Don't include current user
        newBoards[userUuid] = {
          username: users[userUuid],
          rows: [] // Will store arrays of color arrays for each completed row
        };
      }
    });
    setOpponentBoards(newBoards);
  }, [users, uuid]);

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

  const updateGameState = () => {
    sethasWon(true);
  }
  
  const updateSpellCheck = (boolean) => {
    setspellCheck(boolean);
  }

  console.log(spellCheck)

  return (
    <div className="game-container">
      <div className="game-main">
        <div className="player-info">{username} is playing</div>
        
        <div className="game-status">
          {hasWon && (
            <div className="win-message">
              🎉 YOU WON! 🎉
            </div>
          )}

          {spellCheck === 0 && (
            <div className="spell-check-error">Not in word list</div>
          )}

          {round === 7 && !hasWon && (
            <div className="game-over-message">Game Over! The word was "{word}"</div>
          )}
        </div>

        <div className="game-board">
          <Row key={1} uuid={uuid} sock={sock} roomCode={roomCode} isActive={1 === round} round={updateRound} answer={word} updateGameState={updateGameState} hasWon={hasWon} updateSpellCheck={updateSpellCheck}/>
          <Row key={2} uuid={uuid} sock={sock} roomCode={roomCode} isActive={2 === round} round={updateRound} answer={word} updateGameState={updateGameState} hasWon={hasWon} updateSpellCheck={updateSpellCheck}/>
          <Row key={3} uuid={uuid} sock={sock} roomCode={roomCode} isActive={3 === round} round={updateRound} answer={word} updateGameState={updateGameState} hasWon={hasWon} updateSpellCheck={updateSpellCheck}/>
          <Row key={4} uuid={uuid} sock={sock} roomCode={roomCode} isActive={4 === round} round={updateRound} answer={word} updateGameState={updateGameState} hasWon={hasWon} updateSpellCheck={updateSpellCheck}/>
          <Row key={5} uuid={uuid} sock={sock} roomCode={roomCode} isActive={5 === round} round={updateRound} answer={word} updateGameState={updateGameState} hasWon={hasWon} updateSpellCheck={updateSpellCheck}/>
          <Row key={6} uuid={uuid} sock={sock} roomCode={roomCode} isActive={6 === round} round={updateRound} answer={word} updateGameState={updateGameState} hasWon={hasWon} updateSpellCheck={updateSpellCheck}/>
        </div>
      </div>

      {/* Opponents Sidebar */}
      <div className="opponents-sidebar">
        <h3>Opponents</h3>
        {Object.keys(opponentBoards).length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>Waiting for opponents...</p>
          </div>
        ) : (
          Object.keys(opponentBoards).map(userUuid => (
            <OpponentBoard 
              key={userUuid}
              username={opponentBoards[userUuid].username}
              rows={opponentBoards[userUuid].rows}
            />
          ))
        )}
      </div>
    </div>
  )
}

function OpponentBoard({username, rows}) {
  const emptyRow = ['empty', 'empty', 'empty', 'empty', 'empty'];
  
  // Create 6 rows total, fill with completed rows first, then empty rows
  const displayRows = [];
  for (let i = 0; i < 6; i++) {
    displayRows.push(rows[i] || emptyRow);
  }

  return (
    <div className="opponent-board">
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

function Row({isActive, roomCode, uuid, sock, round, answer, updateGameState, hasWon, updateSpellCheck}){
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
  }, [answer]);

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
        let counter = 0; //keeps track of green squares
        const newColorArray = ['empty', 'empty', 'empty', 'empty', 'empty']
        const copy = JSON.parse(JSON.stringify(answerLetterMap)); 
        // work with copy instead of trying to reset answerLetterMap

        for (let i = 0; i < 5; i++) {
          if (value[i] in copy) {
            for (let j = 0; j < copy[value[i]].length; j++) {
              if (copy[value[i]][j] === i) {
                copy[value[i]].splice(j, 1);
                newColorArray[i] = 'green';
                counter++;
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
    if (!hasWon) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [value, index, isActive]);

  return(
    <div className="square_single_row">
      <Square value={value} colorArray={colorArray}/>
    </div>
  );
}

export default Game