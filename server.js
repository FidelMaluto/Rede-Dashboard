const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { exec } = require('child_process');
const os = require('os');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

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

function scanNetwork(callback) {

    exec('arp -a', (err, stdout) => {

        if (err) {
            console.log(err);
            return;
        }

        const lines = stdout.split('\n');

        const devices = [];

        let pending = 0;

        lines.forEach((line) => {

            const match = line.match(
                /(\d+\.\d+\.\d+\.\d+)\s+([a-f0-9-]+)/i
            );

            if (match) {

                const ip = match[1];
                const mac = match[2];

                pending++;

                exec(`ping -a -n 1 ${ip}`, (err2, stdout2) => {

                    let deviceName = 'Desconhecido';

                    const nameMatch = stdout2.match(/Disparando .* \[(.*?)\]/i);

                    if (nameMatch) {
                        deviceName = nameMatch[1];
                    }

                    devices.push({
                        name: deviceName,
                        ip,
                        mac,
                        status: 'online'
                    });

                    pending--;

                    if (pending === 0) {
                        callback(devices);
                    }

                });

            }

        });

    });

}

// WEBSOCKET

wss.on('connection', () => {
    console.log('Novo dashboard conectado');
});

// TEMPO REAL

setInterval(() => {

    scanNetwork((devices) => {

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

    });

}, 3000);

// INICIAR SERVIDOR

server.listen(3000, '0.0.0.0', () => {

    console.log('==============================');
    console.log('🚀 ISP Dashboard Rodando');
    console.log('🌐 http://localhost:3000');
    console.log('==============================');

});
