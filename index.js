const express = require('express')
const app = express()
const http = require('http').Server(app)
const helmet = require('helmet')
const session = require('express-session')
// You can use SQLite to store Data in a DB 
// const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const io = require('socket.io').listen(http)

const raspPiTemp = require('node-raspi') //Helps with GPIO access on Raspberry PI
const sensor = require('node-dht-sensor') // Helps with interacting with DHT sensor 

//Public folder
app.use(express.static(path.join(__dirname, 'public')))

app.use(helmet())
app.set('trust proxy', 1) // Trust the first proxy
app.use(session({
    secret: 's3Cur3',
    name: 'sessionId',
    resave: true,
    saveUninitialized: true
}))

app.set('views', 'views') // specify the views directory
app.set('view engine', 'pug')
app.set('title', 'tempDashboard')

var humidityTemp = "";
var rootTemp = "";
var piTemp = "";

function getPiTemp(io) {
    piTemp = raspPiTemp.getThrm();
    io.emit('piTemp', piTemp);

    getLastUpdate(io);
    return piTemp;
}
function getLastUpdate(io) {
    io.emit('lastupdate', new Date());
}

function getRoomTemp(io) {
    sensor.read(11, 17, function (err, temp, hum) {
        if (!err) {
            temp = temp.toFixed(1);
            roomTemp = temp;
            io.emit('roomTemp', temp);
            getLastUpdate(io);
            return temp;
        }
    });
}
function getHumTemp(io) {
    sensor.read(11, 17, function (err, temp, hum) {
        if (!err) {
            huTemp = hum.toFixed(1);
            io.emit('roomHum', huTemp);
            humidityTemp = huTemp;
            getLastUpdate(io);
            return huTemp;
        } else {

            humidityTemp = "Check Later";
            return "Check Later";
        }
    });
}
    app.get('/data/getTemp', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Temprature: getRoomTemp(io) || roomTemp }));
    });

    app.get('/data/getHum', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Humdity: getHumTemp(io) || humidityTemp }));
    });

    app.get('/', function (req, res) {
        res.render('index', { siteTitle: app.get('title') })
    });

    io.on('connection', function (socket) {
        //console.log(socket);
        io.emit('_ping', "ok");

        socket.on('ping', function (data) {
            console.log('ping');
            io.emit('_ping', "ok");

        });
    });


    function getValues(io) {
        temp = getRoomTemp(io);
        piTemp = getPiTemp(io);
        huTemp = getHumTemp(io);

    }

    setInterval(getValues, 10 * 1000, io);
    http.listen(3111, () => console.log('tempDashboard is listening on port 3111!'));
