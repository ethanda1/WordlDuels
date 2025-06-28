import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client/dist/sockjs';
import Login from './Login';
import Room from './Room';

function App() {
  const [username, setUsername] = useState('');
  const [sock, setSock] = useState(null);
  const [roomCode, setRoomCode] = useState('');

  useEffect(() => {
    const sock = new SockJS('http://localhost:9999/echo');
    setSock(sock);

    return () => {
      sock.close();
    };
  }, []);
  

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Login
              setUsername={setUsername}
              sock={sock}
            />
          }
        />
        <Route path="/:roomCode" element={<Room sock={sock} username={username} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
