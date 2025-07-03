
const words = require('./words.json');
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

                else{
                    conn.write(JSON.stringify({
                        type: 'invalid_roomcode',
                        message: 're-enter roomcode',
                    }));
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
        else if (data.type === 'square_colors') {
            console.log('receiving colors :', data.colors)
            updateSquare(data.roomcode, 'update_row', data.colors, data.uuid);
        }

        else if (data.type === 'update_square'){


        }
        
        //catching unhandled data types
        else {
            console.log(`Unhandled data type: ${data.type}`);
        }
    });

    conn.on('close', function() {
        console.log(`Connection closed: ${conn.id}`);
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
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
}


var server = http.createServer();
echo.installHandlers(server, { prefix: '/echo' });
server.listen(9999, '0.0.0.0', () => {
    console.log('SockJS server listening on http://0.0.0.0:9999/echo');
});
