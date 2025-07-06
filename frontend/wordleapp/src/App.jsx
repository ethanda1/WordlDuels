import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
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
  const [invalidRoomcodeMsg, setinvalidRoomcodeMsg] = useState('')
  const [gameEnding, setgameEnding] = useState(false);
  const [winner, setWinner] = useState(''); //winner's UUID
  

  useEffect(() => {
    const sock = new SockJS('https://3.149.252.70:80/echo');
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

        if (data.type === 'invalid_roomcode'){
          setinvalidRoomcodeMsg('Invalid room code, please try again')
        }
        if (data.type === 'max_users_reached'){
          setinvalidRoomcodeMsg('Room is full, please try another room')
        }

        if (data.type === 'end_game'){
          setgameEnding(true);
          setWinner(data.message)
        }

        if (data.type === 'user_left') {
          console.log('User left:', data.message.username);
          setUsernames(prevUsernames => prevUsernames.filter(name => name !== data.message.username));
          setUsers(prevUsers => {
            const newUsers = { ...prevUsers };
            delete newUsers[data.message.userID];
            return newUsers;
          });
        }
        if (data.type === 'play_again'){
          setWord(data.message);
          setgameStarted(false);
          setgameEnding(false);
          setWinner('')
          setcolorArray([])
          setUserUpdateColor(null);
        }

        if (data.type === 'make_host'){
          setisHost(true);
          console.log("isHost:", username);
        }

        //handles edge case where there is one player left in game
        if(data.type === 'return_room'){
          setWord(data.message);
          setgameStarted(false);
          setgameEnding(false);
          setWinner('')
          setcolorArray([])
          setUserUpdateColor(null);
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
              invalidRoomcodeMsg = {invalidRoomcodeMsg}
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
              gameEnding = {gameEnding}
              winner = {winner} //UUID of winner
              isHost = {isHost}
              gameStarted={gameStarted}
            />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
