var app        = require('http').createServer(),
    io         = require('socket.io').listen(app),
    fs         = require('fs'),
    SerialPort = require("serialport"),
    serial     = new SerialPort.SerialPort("/dev/tty.HC-05-DevB", { baudrate: 9600, parser: SerialPort.parsers.readline("\n") }),
    sockets    = [],
    buffer     = "";

app.listen(8000);

// register incoming socket connections
io.sockets.on('connection', function (socket) {
    sockets.push(socket);
});

serial.open(function () {

    serial.on('data', function(data) {

        // if(sockets.length === 0) {
        //     return;
        // }

        dataHandler(data);

    });
});

var dataHandler = function(data) {

    var msgBus = filterKey(data);

    try {
        data = JSON.parse(data.substr(3,data.length-7));
    } catch(e) {
        return;
    }

    switch(msgBus) {
        case 1:
            emit('resistance',data);
        break;
        case 2:
            emit('button',true);
        break;
    }

};

var filterKey = function(data) {
    var firstBytes = data.substr(0,3),
        lastBytes = data.substr(data.length - 4),
        key = firstBytes[1],
        delimiter = '%';

    if(firstBytes[2] === delimiter && lastBytes[1] === delimiter && lastBytes[0] === key && lastBytes[2] === key) {
        return parseInt(key,10);
    } else {
        return 0;
    }
};

var emit = function(channel, obj) {
    sockets.forEach(function(socket) {
        socket.emit(channel, obj);
    });
};
