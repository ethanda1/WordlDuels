import React, { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
function Login({setUsername, sock}) {
  const [input, setInput] = useState('') 
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault();
    setUsername(input)
    
    sock.send(JSON.stringify({
      type: 'username',
      username: {input},
    }));

    navigate('/game');
  };

  return (
    <div className="login-container">
      <h2>Create Username</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button type="submit">play</button>
      </form>
    </div>
  );
}

export default Login;