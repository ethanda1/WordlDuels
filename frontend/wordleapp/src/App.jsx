import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client/dist/sockjs';
import Login from './Login';
import Room from './Room';
import Game from './Game';

function App() {
  const [username, setUsername] = useState('');
  const [sock, setSock] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [usernames, setUsernames] = useState('');
  const [word, setWord] = useState('');
  const [isHost, setisHost] = useState(false);
  const [gameStarted, setgameStarted] = useState(false);

  useEffect(() => {
    const sock = new SockJS('http://localhost:9999/echo');
    setSock(sock);

    return () => {
      sock.close();
    };
  }, []);
  
  useEffect(() => {
      if (!sock) return;
  
      sock.onmessage = function (e) {
        const data = JSON.parse(e.data);

        //create room
        if (data.type === 'room_code') {
          console.log('Received room code:', data.room_code)
          setRoomCode(data.room_code);
          setUsernames([data.creator]);
          setWord(data.word);
          setisHost(true);
        }

        //joining room
        if (data.type === 'user_joining') {
          console.log('Received room code:', data.room_code)
          setRoomCode(data.room_code);
          setWord(data.word);
        }

        //updating usernames
        if (data.type === 'user_joining_update') {
          console.log('People in party: ', data.message)
          setUsernames(data.message)
        }
        
        if (data.type === 'start_game'){
          setgameStarted(true);
        }
        
      };
    }, [sock]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Login
              setUsername={setUsername}
              sock={sock}
              roomCode = {roomCode}
            />
          }
        />
        <Route 
          path="/:roomCode" 
          element={
            <Room 
              sock={sock} 
              username={username} 
              usernames = {usernames}
              isHost = {isHost}
              gameStarted = {gameStarted}
            />
          } 
        />
        <Route 
          path="/game/:roomCode" 
          element={
            <Game
              sock={sock} 
              username={username} 
              usernames = {usernames}
              word = {word}
            />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
