import React, {useEffect, useState} from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login'; // your initial page where user enters name
import Game from './Game';   // your wordle game page
import SockJS from 'sockjs-client/dist/sockjs';

function App() {
  const [username, setUsername] = useState("");
  const [sock, setSock] = useState(null)
  useEffect(()=>{
      var sock = new SockJS('http://localhost:9999/echo');
      setSock(sock);
      
      //testing
      // sock.onopen = function() {
      //   console.log('open');
      //     sock.send('test');
      // };
  
      sock.onmessage = function(e) {
        //console.log('message', e.data);
        //sock.close();
        const data = JSON.parse(e.data);
        console.log(data.type);
        console.log(data.username);
        sock.close();
      };
  
      // sock.onclose = function() {
      //   console.log('close');
      // };
      

    }, [])
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login setUsername={setUsername} sock={sock}/>} />       {/* This shows on app load */}
        <Route path="/game" element={<Game username= {username} sock={sock}/>} />    {/* Navigates here after login */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;