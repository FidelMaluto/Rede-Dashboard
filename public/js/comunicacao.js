import ws from './websocket.js';

const deviceName = localStorage.getItem('deviceName') || 'Dispositivo';

// Controla quando a lista de dispositivos muda
let totalDevices = 0;

// ENVIAR MENSAGEM

window.sendMessage = function () {

    const input = document.getElementById("messageInput");
    const target = document.getElementById("targetDevice");

    if (!input.value.trim()) return;

    ws.send(JSON.stringify({

        type: "chat",
        deviceName,
        target: target.value,
        text: input.value.trim()

    }));

    input.value = "";

};

// ENVIAR ARQUIVO

window.uploadFile = async function () {

    const file = document.getElementById("fileInput").files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    await fetch("/upload", {

        method: "POST",
        body: formData

    });

};

// RECEBER DADOS

ws.addEventListener("message", (event) => {

    const data = JSON.parse(event.data);

    // CHAT

    if (data.type === "chat") {

        const messages = document.getElementById("messages");

        messages.innerHTML += `

            <div class="message">

                <strong>${data.sender}</strong>

                <small>${data.time}</small>

                <p>${data.text}</p>

            </div>

        `;

        messages.scrollTop = messages.scrollHeight;

        return;

    }

    // ARQUIVOS

    if (data.type === "file") {

        const uploadedFiles = document.getElementById("uploadedFiles");

        uploadedFiles.innerHTML += `

            <div class="file-item">

                <a href="/uploads/${data.filename}" target="_blank">${data.filename}</a>

            </div>

        `;

        return;

    }

    // DISPOSITIVOS

    if (data.devices) {

        if (data.devices.length !== totalDevices) {

            totalDevices = data.devices.length;

            const select = document.getElementById("targetDevice");

            const atual = select.value;

            select.innerHTML = '<option value="all">📢 Todos</option>';

            data.devices.forEach(device => {

                select.innerHTML += `

                    <option value="${device.ip}">${device.name} (${device.type})</option>

                `;

            });

            if ([...select.options].find(o => o.value === atual)) {

                select.value = atual;

            }
        }
    }

});

wss.on("connection", (ws, req) => {

    ws.clientIp = req.socket.remoteAddress.replace("::ffff:", "");
    // restante do código...

});

// Envio de sms privada
if (data.type === "chat") {

    wss.clients.forEach(client => {

        if (client.readyState !== WebSocket.OPEN) return;

        if (data.target === "all" || client.clientIp === data.target || client.clientIp === ws.clientIp) {

            client.send(JSON.stringify({

                type: "chat",
                sender: data.deviceName,
                text: data.text,
                time: new Date().toLocaleTimeString()

            }));

        }

    });

}
