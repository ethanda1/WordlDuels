import React from 'react';
import './App.css'

function App() {

  return (
    <>
      <div className="square_rows">
        <Column/><Column/><Column/><Column/><Column/><Column/>
      </div>
    </>

  )
}

function Square({ size = 50, color = "skyblue" }) {
  return (
    <div className = "square"> 
          
    </div>
  );
}
function Column(){
  return(
    <div className="square_single_row">
      <Square/><Square/><Square/><Square/><Square/>
    </div>
  );
}


export default App
