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
const Whatsapps = require('./config');
const {
    response
} = require('express');
const clientController = require('./controllers/client');
const {
    url
} = require('inspector');
const app = express()
const whitelist = ['http://127.0.0.1:8000'];
const corsOptions = {
    credentials: true, // This is important.
    origin: (origin, callback) => {
        if (whitelist.includes(origin))
            return callback(null, true)

        callback(new Error('Not allowed by CORS'));
    }
}

const server = http.createServer(app);
const key = '48A061273FCD8B758D7E94E15AFC6789139FDD33EECB1E4B0CBE7AAEA28F4295'
const io = socketIO(server, {
    allowEIO3: true,
    cors: {
        origins: 'http://127.0.0.1:8000',
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    },
}).of('/' + key);
app.use(express.json())
app.use(cors())


app.use(express.urlencoded({
    extended: true
}))


const SESSION_FILE_PATH = './whatsapp-session.json';
let sessionCfg;

const client = new Client({
    restartOnAuthFail: true,
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
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

    // client.on('qr', (qr) => {
    //     // Generate and scan this code with your phone
    //     console.log('QR RECEIVED', qr);
    //     qrcode.toDataURL(qr, (err, url) => {
    //         socket.emit('qr', url)
    //         socket.emit('message', 'qr code received, scan please!')
    //     })
    // });

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


client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, async (err, url) => {
        const data = {
            qrcode: url,
            dateAdded: new Date(),
            status: false,
            data: 'Silahkan scan kembali'
        }
        await Whatsapps.add(data)
    })
})

client.on('ready', () => {
    const data = {
        qrcode: null,
        dateAdded: new Date(),
        status: true,
        data: 'login'
    }
    Whatsapps.add(data)
});


client.on('authenticated', () => {
    const data = {
        qrcode: null,
        dateAdded: new Date(),
        status: true,
        data: 'auth'
    }
    Whatsapps.add(data)
});

client.on('auth_failure', function (session) {
    const data = {
        qrcode: null,
        dateAdded: new Date(),
        status: false,
        data: 'Login gagal, silahkan reload halaman dan ulangi kembali'
    }
    Whatsapps.add(data)
});
client.on('disconnected', (reason) => {
    client.destroy();
    client.initialize();
    const data = {
        qrcode: null,
        dateAdded: new Date(),
        status: false,
        data: 'logout'
    }
    Whatsapps.add(data)
});


app.post('/logout', (req, res) => {
    client.logout();
    client.destroy();
    client.initialize();

    res.status(200).json({
        status: true,
    })

})




app.post('/kirim', (req, res) => {
    const number = req.body.number;
    const message = "Kemahasiswaan Universitas Dinamika, Anda mendapatkan feedback dari reviewer";


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