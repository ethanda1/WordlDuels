
const pickedwords = require('./pickedwords.json');
var http = require('http');
var sockjs = require('sockjs');

var echo = sockjs.createServer({ sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' });

let rooms = {};

// rooms = {
//     'roomid': [
//        {
//         username: 'username',
//         userID :  'xxxxxx',
//         conn: conn,
//         word: 'word',
//       }],
// }

echo.on('connection', function(conn) {
    console.log(`New connection: ${conn.id}`);

    let username = null;
    let roomcode = null;

    conn.on('data', function(message) {
        console.log(`Received raw message: ${message}`);

        let data;
        try {
            data = JSON.parse(message);
        } catch (e) {
            console.error('Failed to parse JSON:', e);
            conn.write(JSON.stringify({ type: 'error', error: 'Invalid JSON' }));
            return;
        }

        console.log('Parsed data:', data);
    
        if(data.type === 'register') {
            // roomcode = data.roomCode
            username = data.username

            console.log(data.roomCode)
            //joining room
            
            if(data.roomCode){
                
                roomcode = data.roomCode
                if (!(roomcode in rooms)){
                    conn.write(JSON.stringify({
                        type: 'invalid_roomcode',
                        message: 'Invalid room code, please try again',
                    }));
                return;
                }
                if(rooms[roomcode].length >= 6){
                     conn.write(JSON.stringify({
                        type: 'max_users_reached',
                        message: 'Room is full, please try another room',
                    }));
                    return;
                }
                let UUID = getUniqueUserID(roomcode)
                rooms[roomcode].push(
                    {
                        username: data.username,
                        userID: UUID,
                        conn: conn,
                        word: rooms[roomcode][0].word
                    }
                )

                //let usernames = rooms[data.roomCode].map(u => u.username);

                let users = {}
                if (roomcode in rooms){
                    for(let user of rooms[roomcode]){
                        console.log('adding user' + user.username)
                        //usernames.push(user.username);
                        users[user.userID] = user.username
                    }
                    console.log('people in room: '+ roomcode +  ': ' + users)
                    conn.write(JSON.stringify({
                        type: 'user_joining',
                        room_code: roomcode,
                        word: rooms[roomcode][0].word,
                        conn: conn.id,
                        userID: UUID
                    }));
                    broadcastRoom(roomcode, 'user_joining_update', users)
                }

                console.log(rooms);
            }

            //creating room
            else{
            
                roomcode = generateRoomCode();
                //try again if roomcode is already in room
                while (roomcode in rooms) {
                    console.log(`Room code collision: ${roomCode}. Generating a new one.`);
                    roomcode = generateRoomCode();
                }
                rooms[roomcode] = [];
                let UUID = getUniqueUserID(roomcode)
                rooms[roomcode] = [
                    {
                        username: data.username,
                        userID: UUID,
                        conn: conn,
                        word: generateWord()
                    }
                ];

                console.log(`Created room ${roomcode} with conn: ${conn.id}`);
                console.log('Current rooms:', rooms);

                conn.write(JSON.stringify({
                    type: 'room_code',
                    room_code: roomcode,
                    message: 'room created',
                    creator: data.username,
                    word: rooms[roomcode][0].word,
                    userID: UUID
                }));
                console.log('word:', rooms[roomcode][0].word);
            }
        }

        //syncing games at start
        else if (data.type === 'start_game') {
            console.log('starting game')
            broadcastRoom(data.roomcode, 'start_game', 'game starting')
        }

        //broacasting guesses to room
        else if (data.type === 'square_colors') {
            console.log('receiving colors :', data.colors)
            updateSquare(data.roomcode, 'update_row', data.colors, data.uuid);
        }

        //syncing game end
        else if (data.type === 'game_end'){
            broadcastRoom(data.roomcode, 'end_game', data.uuid)
        }

        //restarting game
        else if (data.type === 'play-again'){
            let newWord = generateWord()
            rooms[data.roomcode].forEach(user => {user.word = newWord});
            broadcastRoom(data.roomcode, 'play_again', newWord)
        }

        
        
        //catching unhandled data types
        else {
            console.log(`Unhandled data type: ${data.type}`);
        }
    }); 

    conn.on('close', function() {
        console.log(`Connection closed: ${conn.id}`);

        Object.keys(rooms).forEach(roomID => {
            const leavingUser = rooms[roomID].find(user => user.conn.id === conn.id);

            console.log(`User ${leavingUser ? leavingUser.username : 'unknown'} left room ${roomID}`);

            //changing hosts
            if(leavingUser && rooms[roomID][0].userID === leavingUser.userID){
                console.log("new host");
                console.log(rooms[roomID] + ': ' + rooms[roomID].length)
                if (rooms[roomID].length >= 2) {
                    rooms[roomID][1].conn.write(JSON.stringify({
                        type: 'make_host',
                    }));
                }
            }
            rooms[roomID] = rooms[roomID].filter(user => user.conn.id !== conn.id);

       
            if (rooms[roomID].length === 1) {
                let newWord = generateWord()
                rooms[roomID][0].word = newWord
                console.log("1 user in room");
                rooms[roomID][0].conn.write(JSON.stringify({
                    type: 'return_room',
                    message: newWord
                }));
            }

            if (rooms[roomID].length === 0) {
                delete rooms[roomID];
            } else if (leavingUser) {
                broadcastRoom(roomID, 'user_left', { username: leavingUser.username, userID: leavingUser.userID });
            }
            

            
            
      
        });
    }); 
});

function broadcastRoom(roomID, type, message){    
    if (roomID in rooms){
        for(let user of rooms[roomID]){
            user.conn.write(JSON.stringify({
                type: type,
                message: message,
            }));
        }
    }
    return;
}

function updateSquare(roomID, type, colors, uuid){    
    if (roomID in rooms){
        for(let user of rooms[roomID]){
            user.conn.write(JSON.stringify({
                type: type,
                colors: colors,
                uuid: uuid
            }));
        }
    }
    return;
}

function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function getUniqueUserID(roomID) {
    let userID;
    let isUnique = false;
    while (!isUnique) {
        userID = generateRoomCode();
        isUnique = !rooms[roomID].some(user => user.userID === userID);
    }
    return userID;
}

function generateWord() {
    const randomIndex = Math.floor(Math.random() * pickedwords.length);
    return pickedwords[randomIndex];
}


var server = http.createServer();
echo.installHandlers(server, { prefix: '/echo' });
server.listen(9999, '0.0.0.0', () => {
    console.log('SockJS server listening on http://0.0.0.0:9999/echo');
});
