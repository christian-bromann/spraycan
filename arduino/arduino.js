var app       = require('http').createServer(),
    io        = require('socket.io').listen(app),
    fs        = require('fs'),
    BTSP      = require('bluetooth-serial-port'),
    serial    = new BTSP.BluetoothSerialPort(),
    sockets   = [],
    buffer    = "",
    connected = false;

app.listen(8000);

// register incoming socket connections
io.sockets.on('connection', function (socket) {
    sockets.push(socket);

    if(!connected) {
        // search for bluetooth connections
        serial.inquire();
    }
});

serial.on('found', function(address, name) {
 
    // check the found address with the address of the
    // bluetooth enabled Arduino device here.
    if(name !== 'HC-06') {
        return false;
    }

    console.log('found bluetooth module',name, 'at address',address);
 
    serial.findSerialPortChannel(address, function(channel) {
        console.log('found channel: ',channel);
        serial.connect(address, channel, function() {

            connected = true;

            serial.on('data', function(data) {

                if(sockets.length === 0) {
                    return;
                }

                data = data.toString('utf-8');

                if(data.indexOf('\r\n') >= 0) {
                    dataHandler(buffer + data.split(/\r\n/)[0]);
                    buffer = data.split(/\r\n/)[1];
                } else {
                    buffer += data;
                }
            });
        }, function () {
            console.log('cannot connect');
        });
    });
});

var dataHandler = function(data) {

    var msgBus = filterKey(data),
        msg = clear(data);

    try {
        msg = JSON.parse(msg);
    } catch(e) {
        return;
    }

    switch(msgBus) {
        case 1:
            var x = Math.round(msg.x / 100),
                y = Math.round(msg.y / 100),
                z = Math.round(msg.z / 100);

            emit('gyroscope', { x: x, y: y, z: z });
        break;
        case 2:
            emit('resistance',msg);
        break;
        case 3:
            emit('button',true);
        break;
    }

};

var clear = function(data) {
    data = data.substr(3).replace(/\r\n/,'');

    return data.substr(0,data.length - 3);
};

var filterKey = function(data) {
    var firstBytes = data.substr(0,3),
        lastBytes = data.replace(/\r\n/,'').substr(data.length - 3),
        key = firstBytes[1],
        delimiter = firstBytes[0];

    if(firstBytes[2] === delimiter && lastBytes[1] === delimiter &&
       lastBytes[0] === key && lastBytes[2] === key) {
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
