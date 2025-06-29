var http = require('http');
var sockjs = require('sockjs');

var echo = sockjs.createServer({ sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' });

// let usernames = [];
let rooms = {};

// rooms = {
//     'roomid': [
//            {
//         'username': 'asdjadfj',
//         'connection': conn
//     }],
// }

echo.on('connection', function(conn) {
    console.log(`New connection: ${conn.id}`);
    // suggestion: (different for each conn)
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

        // if (data.username) {
        //     usernames.push(data.username);
        //     console.log('Updated usernames:', usernames);
        // }

        // if (data.type === 'register') {
        // get the username from the data, set username = data.username

        // example register message
        // {
        //     type: 'register',
        //     username: 'Caleb',
        //     roomCode?: ''
        // }

        if(data.type === 'register') {
            // roomcode = data.roomCode
            username = data.username

            console.log(data.roomCode)
            //joining room
            if(data.roomCode){
                roomcode = data.roomCode
                rooms[roomcode].push(
                    {
                        username: data.username,
                        conn: conn
                    }
                )

                // usernames = rooms[data.roomCode].map(u => u.username);

                let usernames = []
                if (data.roomCode in rooms){
                    for(let user in rooms[roomcode]){
                        usernames.push(user['username']);
                    }
                    conn.write(JSON.stringify({
                        type: 'register_awk',
                        usernames: usernames,

                    }));
                    
                }

                else{
                    conn.write(JSON.stringify({
                        type: 'invalid_roomcode',
                        message: 're-enter roomcode',
                    }));
                }
                console.log(rooms);

                // conn.write(JSON.stringify({
                //     type: 'user_joined',
                //     message: 'room joined',
                //     user: data.usernameInput
                // }));
            }

            //creating room
            else{
                roomcode = generateRoomCode();
                while (roomcode in rooms) {
                    console.log(`Room code collision: ${roomCode}. Generating a new one.`);
                    roomcode = generateRoomCode();
                }
                rooms[roomcode] = [
                    {
                        username: data.username,
                        conn: conn
                    }
                ];
                console.log(`Created room ${roomcode} with conn: ${conn.id}`);
                console.log('Current rooms:', rooms);

                conn.write(JSON.stringify({
                    type: 'room_code',
                    room_code: roomcode,
                    message: 'room created',
                    creator: data.username
                }));
            }


        }
        // if (data.type === 'create_room') {
        //     let roomCode = generateRoomCode();
        //     while (roomCode in rooms) {
        //         console.log(`Room code collision: ${roomCode}. Generating a new one.`);
        //         roomCode = generateRoomCode();
        //     }

        //     rooms[roomCode] = [conn];
        //     console.log(`Created room ${roomCode} with user: ${data.username}`);
        //     console.log('Current rooms:', rooms);
            

        //     conn.write(JSON.stringify({
        //         type: 'room_code',
        //         room_code: roomCode,
        //         message: 'room created',
        //         creator: data.username
        //     }));
        // } 
        
        // if(data.type === 'join_room') {
        //     // roomcode = data.roomCode
        //     rooms[data.roomCode].push(conn);
        //     conn.write(JSON.stringify({
        //         type: 'user_joining',
        //         message: 'room joined',
        //         user: data.usernameInput
        //     }));
        // }

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
        for(let user in rooms[roomID]){
            user['connection'].write(JSON.stringify({
                type: type,
                message: message,
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

var server = http.createServer();
echo.installHandlers(server, { prefix: '/echo' });
server.listen(9999, '0.0.0.0', () => {
    console.log('SockJS server listening on http://0.0.0.0:9999/echo');
});
