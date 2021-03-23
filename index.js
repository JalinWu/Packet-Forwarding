const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const net = require('net');
const tcpServer = net.createServer();
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.set('view engine', 'ejs');

app.use('/', express.static('./public'));
 
app.get('/', function (req, res) {
//   res.send('Hello World')
  res.render('index', {
      data: "Hello World!"
  })
})

let webSocket = new Array();

function webSocketEmit(socket, data) {
    socket.emit('message', data.toString())
}

// web socket connect
io.on('connection', (socket) => {
    let webSocketId = socket.id;
    console.log('Web Socket connected: ' + webSocketId);
    webSocket.push(socket);
    
    // socket.emit('message', 'Welcome!')

    socket.on('disconnect', () => {
        webSocket.splice(webSocket.indexOf(socket), 1);
        
        io.emit('message', 'A user has left!')
    })
})

// TCP connect
tcpServer.on('connection', (socket) => {
    let tcpClientIP = socket.remoteAddress + ":" + socket.remotePort;
    console.log('TCP client connected: ' + tcpClientIP);

    // TCP send data
    socket.on('data', (data) => {
        console.log('TCP client send data: ' + data);
        webSocket.forEach((ws) => {
            webSocketEmit(ws, data);
        })
    })
    
})
 
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
})

const tcpPORT = process.env.tcpPORT || 3003;
tcpServer.listen(tcpPORT, () => {
  console.log(`TCP Server started on port ${tcpPORT}`)
})