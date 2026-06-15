const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { exec } = require('child_process');
const os = require('os');
const path = require('path');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// PEGAR IP DO SERVIDOR
function getServerIP() {

    const interfaces = os.networkInterfaces();

    for (let name in interfaces) {
        for (let net of interfaces[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }

    return 'Não encontrado';
}

// ESCANEAR REDE
let devices = [];

wss.on('connection', (ws, req) => {

    let ip = req.socket.remoteAddress;
    ip = ip.replace('::ffff:', '');

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        // REGISTRAR DISPOSITIVO
        if (data.type === 'register') {

            const exists = devices.find(d => d.ip === ip);

            if (exists) {

                exists.name = data.deviceName;
                exists.type = data.deviceType;
                exists.mac = data.mac;
                
            } else {
                devices.push({
                    name: data.deviceName,
                    type: data.deviceType,
                    ip,
                    mac: data.mac,
                    status: 'online'
                });
            }
        }

        // CHAT
        if (data.type === "chat") {

            wss.clients.forEach(client => {

                if (client.readyState !== WebSocket.OPEN) return;

                const clientIp = client._socket.remoteAddress.replace("::ffff:", "");

                if (data.target === "all" || clientIp === data.target || clientIp === ip) {

                    client.send(JSON.stringify({

                        type: "chat",
                        sender: data.deviceName,
                        text: data.text,
                        time: new Date().toLocaleTimeString(),
                        target: data.target

                    }));

                }

            });

        }
    });

    ws.on('close', () => {
        devices = devices.filter(d => d.ip !== ip);
    });

});

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// WEBSOCKET
wss.on('connection', () => {
    console.log('Novo dashboard conectado');
});

// TEMPO REAL
setInterval(() => {

    const data = {

        serverIP: getServerIP(),
        total: devices.length,
        time: new Date().toLocaleTimeString(),
        devices

    };

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });

}, 1000);

app.post('/upload', upload.single('file'), (req, res) => {
    const fileData = {
        type: 'file',
        filename: req.file.filename
    };

    // ENVIAR PARA TODOS
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(fileData));
        }
    });

    res.json(fileData);

});

// INICIAR SERVIDOR
server.listen(3000, '0.0.0.0', () => {
    console.log('Dashboard Rodando em --> http://localhost:3000');
});
