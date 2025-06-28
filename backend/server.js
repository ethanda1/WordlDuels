var http = require('http');
var sockjs = require('sockjs');

var echo = sockjs.createServer({ sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' });

let usernames = [];
let rooms = {};

echo.on('connection', function(conn) {
    console.log(`New connection: ${conn.id}`);

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

        if (data.username) {
            usernames.push(data.username);
            console.log('Updated usernames:', usernames);
        }

        if (data.type === 'create_room') {
            let roomCode = generateRoomCode();
            while (roomCode in rooms) {
                console.log(`Room code collision: ${roomCode}. Generating a new one.`);
                roomCode = generateRoomCode();
            }

            rooms[roomCode] = [data.username];
            console.log(`Created room ${roomCode} with user: ${data.username}`);
            console.log('Current rooms:', rooms);
            

            conn.write(JSON.stringify({
                type: 'room_code',
                room_code: roomCode,
                message: 'room created',
                creator: data.username
            }));
        } else {
            console.log(`Unhandled data type: ${data.type}`);
        }
    });

    conn.on('close', function() {
        console.log(`Connection closed: ${conn.id}`);
    });
});

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
