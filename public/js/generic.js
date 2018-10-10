var socket = io();

socket.on('piTemp', function (msg) {
    document.getElementById('piTemp').innerHTML = msg + " C";
});
socket.on('roomTemp', function (msg) {
    document.getElementById('roomTemp').innerHTML = msg + " C";
});

socket.on('roomHum', function (msg) {
    document.getElementById('roomHum').innerHTML = msg + " %";
});


socket.on('disconnect', function () {
    ServerNotResponding = true;
});


window.setInterval(function () {
    setBack();
}, 60);

