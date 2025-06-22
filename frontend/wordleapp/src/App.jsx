import React, {useState, useEffect, useMemo} from 'react';
import './App.css'


function App() {
  const word = 'Sheep'
  const [round, setRound] = useState(1);
  const [hasWon, sethasWon] = useState(false);
  
  const updateRound = () => {
    setRound(round => round + 1)

  }

  const updateGameState = () => {
    sethasWon(true);
  }

  return (
    <>
    {hasWon && (
    <div>
        YOU WON
    </div>
    )}
   

      <div>
        <Row key={1} isActive = {1 === round} round= {updateRound} answer = {word} updateGameState  = {updateGameState} hasWon = {hasWon}/>
        <Row key={2} isActive = {2 === round} round= {updateRound} answer = {word} updateGameState  = {updateGameState} hasWon = {hasWon}/>
        <Row key={3} isActive = {3 === round} round= {updateRound} answer = {word} updateGameState  = {updateGameState} hasWon = {hasWon}/>
        <Row key={4} isActive = {4 === round} round= {updateRound} answer = {word} updateGameState  = {updateGameState} hasWon = {hasWon}/>
        <Row key={5} isActive = {5 === round} round= {updateRound} answer = {word} updateGameState  = {updateGameState} hasWon = {hasWon}/>
        <Row key={6} isActive = {6 === round} round= {updateRound} answer = {word} updateGameState  = {updateGameState} hasWon = {hasWon}/>
      </div>
    </>
  )
}

function Square({value, colorArray}) {

  return (
    value.map((item, index) => {
      if (colorArray[index] === 'green'){
      return (
        <div className = "square-green">
          {item}
        </div>
        )
      }
      else if (colorArray[index] === 'yellow'){
        return(
         <div className = "square-yellow">
          {item}
        </div>
        )
      }
      else if (colorArray[index] === 'empty'){
         return(
        <div className = "square">
          {item}
        </div>
         )
      }

})
  );
}
function Row({isActive, round, answer, updateGameState, hasWon}){

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

        if(e.key === 'Enter' && index === 5){
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
          setcolorArray(newColorArray);
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
      <Square value = {value} colorArray = {colorArray}/>
    </div>
  );
}


export default App
