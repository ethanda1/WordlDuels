import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Room({ sock, setUsername, usernames, isHost, gameStarted}) {
    const navigate = useNavigate();
    const { roomCode } = useParams();
    const [players, setPlayers] = useState([]);
    const [copied, setCopied] = useState(false);
    
    useEffect(()=> {
        if (gameStarted){
            navigate(`/game/${roomCode}`);
        }
    }, [gameStarted])
    
    const handlePlay = () => {
        // In a real app, this would emit a socket event to start the game
        console.log('Starting game...');
        sock.send(
            JSON.stringify({
                type: 'start_game',
                roomcode: roomCode
            })
        );
    };
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    return (
        <div className="room-container">
            <div className="room-header">
                <h1>Game Lobby</h1>
                <div className="room-code-container">
                    <p>Room Code:</p>
                    <div className="room-code-display">
                        <span>{roomCode}</span>
                        <button 
                            className={`copy-btn ${copied ? 'copied' : ''}`}
                            onClick={copyToClipboard}
                        >
                            {copied ? '✓ Copied' : 'Copy'}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="players-section">
                <h2>Players ({usernames.length})</h2>
                <div className="players-list">
                    {usernames.length > 0 ? (
                        usernames.map((username, index) => (
                            <div key={index} className="player-card">
                                <div className="player-avatar">
                                    <div className="avatar-placeholder"></div>
                                </div>
                                <span className="player-name">{username}</span>
                                {index === 0 && <span className="host-badge">Host</span>}
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">👤</div>
                            <p>Waiting for players to join...</p>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="action-section">
                {isHost && (  
                <button 
                    className="play-button"
                    onClick={handlePlay}
                    disabled={usernames.length < 2}
                >
                    Start Game
                </button>)}
              
                {usernames.length < 2 && (
                    <p className="min-players-warning">Need at least 2 players to start</p>
                )}
            </div>
        
        </div>
    );
}

export default Room;