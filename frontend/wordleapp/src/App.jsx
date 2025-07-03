import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client/dist/sockjs';
import Login from './Login';
import Room from './Room';
import Game from './Game';

function App() {
  const [sock, setSock] = useState(null);
  const [username, setUsername] = useState('');   //client's username
  const [uuid, setUuid] = useState('');           //client's UUID
  const [usernames, setUsernames] = useState(''); //other players usernames
  const [users, setUsers] = useState({});         //other users (dictionary)
  const [roomCode, setRoomCode] = useState('');
  const [word, setWord] = useState('');
  const [isHost, setisHost] = useState(false);
  const [gameStarted, setgameStarted] = useState(false);
  const [colorArray, setcolorArray] = useState([]);
  const [userUpdateColor, setUserUpdateColor] = useState();

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
          setUuid(data.userID);
        }

        //joining room
        if (data.type === 'user_joining') {
          console.log('Received room code:', data.room_code)
          setRoomCode(data.room_code);
          setWord(data.word);
          setUuid(data.userID);
        }

        //updating usernames and users
        if (data.type === 'user_joining_update') {
          console.log('People in party: ', data.message)
          setUsernames(Object.values(data.message));
          setUsers(data.message);
        }
        
        if (data.type === 'update_row'){
          console.log('got update: trying to update colors: ', data.colors, 'for user: ', data.uuid)
          setcolorArray(data.colors)
          setUserUpdateColor(data.uuid)
          
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
              users = {users}
              word = {word}
              uuid = {uuid}
              colorArray = {colorArray}
              userUpdateColor = {userUpdateColor}
              roomCode = {roomCode}
            />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
