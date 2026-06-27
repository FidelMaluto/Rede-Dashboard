import ws from "./websocket.js";

// DETECTAR NOME DO DISPOSITIVO
function getDeviceName() {

    const userAgent = navigator.userAgent;

    if (/android/i.test(userAgent)) return 'Android';
    if (/iphone/i.test(userAgent)) return 'iPhone';
    if (/windows/i.test(userAgent)) return 'Windows PC';
    if (/mac/i.test(userAgent)) return 'MacBook';

    return 'Dispositivo';
}

const deviceName = localStorage.getItem("deviceName") || getDeviceName();

function generateFakeMac() {
    return "XX:XX:XX:XX:XX:XX".replace(/X/g, () => {

            return Math.floor(Math.random() * 16 ).toString(16);

        });
}

// ENVIAR DADOS AO SERVIDOR
ws.onopen = () => {

    ws.send(JSON.stringify({

        type: 'register',
        deviceName: localStorage.getItem('deviceName'),
        deviceType: getDeviceType(),
        mac: generateFakeMac()

    }));

};

// GRÁFICO
const ctx = document.getElementById('trafficChart');
const trafficChart = new Chart(ctx, {

    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Dispositivos Conectados',
            data: [],
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56,189,248,0.2)',
            tension: 0.4,
            fill: true
        }]
    },

    options: {

        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    }

});

// RECEBER DADOS
ws.onmessage = (event) => {

    const data = JSON.parse(event.data);

    // ARQUIVOS
    if (data.type === 'file') {

        const uploadedFiles = document.getElementById('uploadedFiles');

        uploadedFiles.innerHTML += `

        <div class="file-item">
            
            <a href="/uploads/${data.filename}" target="_blank">${data.filename}</a>

        </div>

    `;

        return;
    }

    // CHAT
    if (data.type === 'chat') {

        const messages = document.getElementById('messages');

        messages.innerHTML += `

            <div class="message">
                <strong>${data.sender}</strong>
                <small>(${data.time})</small>
                <p>${data.text}</p>
            </div>

        `;

        messages.scrollTop = messages.scrollHeight;

        return;
    }

    // DASHBOARD
    document.getElementById('serverIP').innerText = data.serverIP;
    document.getElementById('total').innerText = data.total;
    document.getElementById('time').innerText = data.time;

    // TABELA

    const tbody = document.getElementById('devices');

    tbody.innerHTML = '';

    data.devices.forEach(device => {

        tbody.innerHTML += `
                    <tr>
                        <td>${device.name}</td>
                        <td>${device.type}</td>
                        <td>${device.ip}</td>
                        <td>${device.mac}</td>
                        <td class="online">${device.status}</td>
                    </tr>
                `;
    });

    // GRÁFICO
    trafficChart.data.labels.push(data.time);
    trafficChart.data.datasets[0].data.push(data.total);

    if (trafficChart.data.labels.length > 10) {

        trafficChart.data.labels.shift();
        trafficChart.data.datasets[0].data.shift();

    }

    trafficChart.update();

};

// ENVIAR MENSAGEM
function sendMessage() {
    const input = document.getElementById('messageInput');

    if (!input.value) return;

    ws.send(JSON.stringify({

        type: 'chat',
        deviceName,
        text: input.value

    }));

    input.value = '';

}

// UPLOAD
async function uploadFile() {
    const file = document.getElementById('fileInput').files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append('file', file);

    await fetch('/upload', {
        method: 'POST',
        body: formData
    });

}
