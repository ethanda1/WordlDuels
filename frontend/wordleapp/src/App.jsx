import React, {useState, useEffect} from 'react';
import './App.css'


function App() {
  const [round, setRound] = useState(1);
  
  const updateRound = () => {
    setRound(round => round + 1)

  }

  return (
    <>
      <div>
        <Row key={1} isActive = {1 === round} round= {updateRound}/>
        <Row key={2} isActive = {2 === round} round= {updateRound}/>
        <Row key={3} isActive = {3 === round} round= {updateRound}/>
        <Row key={4} isActive = {4 === round} round= {updateRound}/>
        <Row key={5} isActive = {5 === round} round= {updateRound}/>
        <Row key={6} isActive = {6 === round} round= {updateRound}/>
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
function Row({isActive ,round}){

  const [value, setValue] = useState(['', '', '', '', '']);
  const [index, setIndex] = useState(0); // current input index


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
        }
        console.log(e.key);
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
