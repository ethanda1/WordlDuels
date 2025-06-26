var http = require('http');
var sockjs = require('sockjs');

var echo = sockjs.createServer({ sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' });
let usernames = []
//username
echo.on('connection', function(conn) {
    conn.on('data', function(message) {

    let data;
    try {
        data = JSON.parse(message);
    } catch (e) {
        conn.write(JSON.stringify({ type: 'error', error: 'Invalid JSON' }));
        return;
    }
    usernames.push(data.username)
    console.log('USERNAMES:', usernames)

    if (data.type === 'username'){
        conn.write(JSON.stringify({
            type:'username_ack',
            username: usernames[0],
            message: `welcome,${data.username}`

        }))

    }

    // Handle data.type and data fields here
    });

    conn.on('close', function() {});
});



var server = http.createServer();
echo.installHandlers(server, {prefix:'/echo'});
server.listen(9999, '0.0.0.0');