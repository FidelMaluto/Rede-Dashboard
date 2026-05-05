const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Servir frontend
app.use(express.static('public'));

// Lista de clientes conectados
let clients = [];

// Conexão WebSocket
wss.on('connection', (ws, req) => {

    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    ip = ip.replace('::ffff:', '');

    console.log('Novo dispositivo conectado:', ip);

    // evita duplicados
    const exists = clients.find(c => c.ip === ip);

    if (!exists) {
        clients.push({ ip, ws });
    }

    // remover quando desconectar
    ws.on('close', () => {
        console.log('Dispositivo saiu:', ip);
        clients = clients.filter(c => c.ip !== ip);
    });
});

// Enviar dados em tempo real para o dashboard
setInterval(() => {

    const data = {
        devices: clients.map((c, index) => ({
            name: `Dispositivo ${index + 1}`,
            ip: c.ip,
            status: "online"
        })),
        total: clients.length,
        time: new Date().toLocaleTimeString()
    };

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });

}, 2000);

// Iniciar servidor na rede
server.listen(3000, '0.0.0.0', () => {
    console.log('Servidor rodando em http://0.0.0.0:3000');
});
