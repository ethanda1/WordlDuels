import React, { useState, useEffect } from 'react';
import './css/Login.css';
import { useNavigate } from 'react-router-dom';

function Login({ setUsername, sock, roomCode, invalidRoomcodeMsg }) {
  const [usernameInput, setUsernameInput] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [invalidUsernameMsg, setInvalidUsernameMsg] = useState('');

  const navigate = useNavigate();
  

  useEffect(()=>{
    navigate(`${roomCode}`)
  },[roomCode])

  const handleupdateUsername = (e) => {
    if (e.target.value.length > 20) {
      return;
    }
    setUsernameInput(e.target.value); 
  }

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
    if (!usernameInput){
      setInvalidUsernameMsg('Please enter a username');
      return;

    } 

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
         <div className="logo-icon">
          <div className="duels-letter">D</div>
          <div className="duels-letter">U</div>
          <div className="duels-letter">E</div>
          <div className="duels-letter">L</div>
          <div className="duels-letter">S</div>
        </div>
      </div>

      <form className="login-form">
        <div className="input-group">
          <i className="fas fa-user"></i>
          <input
            type="text"
            placeholder="Your Name"
            value={usernameInput}
            onChange={handleupdateUsername}
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
         {roomCodeInput.length > 4 ? (
              <button className="primary-btn" onClick={handleJoin}>
                <i className="fas fa-sign-in-alt"></i>
                Join Room
              </button>
            ) : (
              <button className="primary-btn-disabled" disabled>
                <i className="fas fa-sign-in-alt"></i>
                Join Room
              </button>
            )}

          <div className = "invalid-msg">{invalidRoomcodeMsg}</div>

          <div className="divider">or</div>

          <button className="secondary-btn" onClick={handleCreate}>
            <i className="fas fa-plus-circle"></i>
            Create a Room
          </button>
          <div className="invalid-msg">{invalidUsernameMsg}</div>
        </div>
      </form>
    </div>
  );
}

export default Login;
