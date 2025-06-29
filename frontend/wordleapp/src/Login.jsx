import React, { useState, useEffect } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

function Login({ setUsername, sock, roomCode }) {
  const [usernameInput, setUsernameInput] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');

  const navigate = useNavigate();
  

  useEffect(()=>{
    navigate(`${roomCode}`)
  },[roomCode])


  //joining room
  const handleJoin = (e) => {
    e.preventDefault();
    if (!usernameInput || !roomCodeInput) return;

    setUsername(usernameInput);

    sock.send(
      JSON.stringify({
        type: 'register',
        username: usernameInput,
        roomCode: roomCodeInput,
      })
    );

    
  };
  
  //create room
  const handleCreate = (e) => {
    e.preventDefault();
    if (!usernameInput) return;

    setUsername(usernameInput);

    sock.send(
      JSON.stringify({
        type: 'register',
        username: usernameInput,
      })
    );
  };

  return (
    <div className="login-container">
      <div className="animation-container">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
      </div>

      <div className="logo">
        <div className="logo-icon">
          <div className="letter">W</div>
          <div className="letter">O</div>
          <div className="letter">R</div>
          <div className="letter">D</div>
          <div className="letter">L</div>
        </div>
        <h1>Wordle Duels</h1>
        <p>Challenge friends in real-time word battles</p>
      </div>

      <form className="login-form">
        <div className="input-group">
          <i className="fas fa-user"></i>
          <input
            type="text"
            placeholder="Your Name"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
          />
        </div>

        <div className="input-group">
          <i className="fas fa-door-open"></i>
          <input
            type="text"
            placeholder="Room Code"
            value={roomCodeInput}
            onChange={(e) => setRoomCodeInput(e.target.value)}
          />
        </div>

        <div className="btn-group">
          <button className="primary-btn" onClick={handleJoin}>
            <i className="fas fa-sign-in-alt"></i>
            Join Room
          </button>

          <div className="divider">or</div>

          <button className="secondary-btn" onClick={handleCreate}>
            <i className="fas fa-plus-circle"></i>
            Create a Room
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
