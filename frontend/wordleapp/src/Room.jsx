import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import './App.css';
import { useNavigate } from 'react-router-dom';

function Room({ sock, setUsername }) {
    const navigate = useNavigate();
    
    const { roomCode } = useParams()
    const [players, setPlayers] = useState('')
    


    return (
        <>
        <div>room</div>
        <div>{roomCode}</div>
        <div>{players}</div>
        </>
    );

    
}
export default Room;
