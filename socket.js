var app    = require('http').createServer(),
    io     = require('socket.io').listen(app),
    fs     = require('fs');

app.listen(8000);

var sockets = [];

io.sockets.on('connection', function (socket) {

    sockets.push(socket);
    socket.on('position', function(pos) {
        
        sockets.forEach(function(socket) {
            socket.emit('position',pos);
        });

    });

});