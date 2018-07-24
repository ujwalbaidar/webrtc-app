const express = require('express');
const fs = require('fs');
let app = express();
require('./server/configs/express')(app);
// var http = require('http').Server(app);
var https = require('https')

let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
global.config = require('./server/configs')[env];

const options = {
	key: fs.readFileSync('./certs/abels-key.pem'),
    cert: fs.readFileSync('./certs/abels-cert.pem'),
}

const httpsServer = https.createServer(options, app)

// const io = require('socket.io')(httpsServer);

// io.on('connection', function(socket){
// 	console.log('a user connected');

// 	socket.on('message', function(message) {
// 	    log('Client said: ', message);
// 	    socket.broadcast.emit('message', message);
// 	})
// });

httpsServer.listen(config.port, config.host, function(){
	console.log(`Server Running at: https://${config.host}:${config.port}`);
});