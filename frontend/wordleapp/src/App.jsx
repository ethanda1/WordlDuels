import React, {useState, useEffect} from 'react';
import './App.css'


function App() {
  const word = 'Crane'
  const [round, setRound] = useState(1);
  
  const updateRound = () => {
    setRound(round => round + 1)

  }

  return (
    <>
      <div>
        <Row key={1} isActive = {1 === round} round= {updateRound} answer = {word}/>
        <Row key={2} isActive = {2 === round} round= {updateRound} answer = {word}/>
        <Row key={3} isActive = {3 === round} round= {updateRound} answer = {word}/>
        <Row key={4} isActive = {4 === round} round= {updateRound} answer = {word}/>
        <Row key={5} isActive = {5 === round} round= {updateRound} answer = {word}/>
        <Row key={6} isActive = {6 === round} round= {updateRound} answer = {word}/>
      </div>
    </>
  )
}

function Square({value}) {

  return (
    value.map((item) => (
      <div className = "square">
        {item}
      </div>
    ))
  );
}
function Row({isActive, round, answer}){

  const [value, setValue] = useState(['', '', '', '', '']);
  const [index, setIndex] = useState(0); // current input index
  const answerArray= answer.toUpperCase().split('');
  let answerLetterMap = {
    //map contains indexs of each letter
  };

  const [colors, setColors] = useState([])
  for (let i = 0; i < answer.length; i++) {
    if(!(answerArray[i] in answerLetterMap)){
      answerLetterMap[answerArray[i]] = [i];
    }
    else{
      answerLetterMap[answerArray[i]].push(i);
    }
  }
  const copy = answerLetterMap

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
          round();
          for(let i=0; i<5; i++){
            if(value[i] in answerLetterMap){ //checking for green and yellow
              for(let j=0; j<answerLetterMap[value[i]].length; j++){
                if(answerLetterMap[value[i]][j] === i){ //checking for green
                  answerLetterMap[value[i]].splice(j,1); //removes green letter index from map
                }
                
              }
              //checks yellow 
              answerLetterMap[value[i]].splice(0,1); //removes yellow letter
            }
          }
          answerLetterMap = copy;
        }
        
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [value, index, isActive]);

  
  return(
    <div className="square_single_row">
      <Square value = {value}/>
    </div>
  );
}


export default App
