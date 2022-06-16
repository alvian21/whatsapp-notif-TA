const {
    Client,
    LocalAuth,
    ClientInfo,
    List
} = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const cors = require('cors')
const {
    response
} = require('express');
const clientController = require('./controllers/client')
const app = express()
const server = http.createServer(app);
const key = '48A061273FCD8B758D7E94E15AFC6789139FDD33EECB1E4B0CBE7AAEA28F4295'
const io = socketIO(server, {
    cors: {
        origin: "http://127.0.0.1:8000",
        methods: ["GET", "POST"]
    }
}).of('/' + key);
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({
    extended: true
}))

// var news = io.on('connection', function (socket) {
//     clientController.connection_client(news, socket)
// })


const SESSION_FILE_PATH = './whatsapp-session.json';
let sessionCfg;
// if (fs.existsSync(SESSION_FILE_PATH)) {
//     sessionCfg = require(SESSION_FILE_PATH);
// }


const client = new Client({
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            // '--disable-setuid-sandbox',
            // '--disable-dev-shm-usage',
            // '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ],
    },
    authStrategy: new LocalAuth()
});


app.get('/', (req, res) => {
    res.sendFile('index.html', {
        root: __dirname
    })
})

client.on('authenticated', () => {
    console.log('AUTHENTICATED');

});


client.on('message', msg => {
    if (msg.body == '!ping') {
        msg.reply('pong');
    }
});

client.initialize();



// socket io

io.on('connection', function (socket) {
    socket.emit('message', 'connectingg....');

    client.on('qr', (qr) => {
        // Generate and scan this code with your phone
        console.log('QR RECEIVED', qr);
        qrcode.toDataURL(qr, (err, url) => {
            socket.emit('qr', url)
            socket.emit('message', 'qr code received, scan please!')
        })
    });

    client.on('ready', () => {
        socket.emit('message', 'whatsapp is ready!')
        getInfo().then(function (data) {
            console.log(data);
        })
    });
    client.on('auth_failure', function (session) {
        socket.emit('message', 'Auth failure, restarting...');
    });
    client.on('disconnected', (reason) => {
        socket.emit('message', 'Whatsapp is disconnected!');


        client.initialize();
    });


    socket.on('logout', function (data) {
        console.log(data);
        client.logout();
        client.initialize();
    })

})

async function getInfo() {
    const info = await client.info.wid
    return info;
}

app.post('/kirim', (req, res) => {
    const number = req.body.number;
    const message = "Kemahasiswaan Universitas Dinamika, Anda mendapatkan feedback dari reviewer";
    // const pesanList = `Kemahasiswaan Universitas Dinamika %0a ` + message
   
    client.sendMessage(number, message).then(response => {
        res.status(200).json({
            status: true,
            response: response
        })
    }).catch(err => {
        res.status(500).json({
            status: false,
            response: err
        })
    })
})


app.post('/info', (req, res) => {
    var header_key = req.body.key

    if (header_key === key) {
        getInfo().then(function (data) {
            res.status(200).json({
                status: true,
                response: data
            })
        }).catch((err) => {
            res.status(500).json({
                status: false,
                response: err
            })
        })
    } else {
        res.status(200).json({
            status: false
        })
    }


})




server.listen(9000, function () {
    console.log('app running' + 9000);
})