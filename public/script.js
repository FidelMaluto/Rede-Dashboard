const ws = new WebSocket(`ws://${location.host}`);

// DETECTAR NOME DO DISPOSITIVO

function getDeviceName() {

    const userAgent = navigator.userAgent;

    if (/android/i.test(userAgent)) return 'Android';

    if (/iphone/i.test(userAgent)) return 'iPhone';

    if (/windows/i.test(userAgent)) return 'Windows PC';

    if (/mac/i.test(userAgent)) return 'MacBook';

    return 'Dispositivo';
}

// ENVIAR DADOS AO SERVIDOR

ws.onopen = () => {

    ws.send(JSON.stringify({
        type: 'register',
        deviceName: getDeviceName()
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
                <td>${device.ip}</td>
                <td class="online">${device.status}</td>
            </tr>
        `;

    });

// ATUALIZAR GRÁFICO

    trafficChart.data.labels.push(data.time);

    trafficChart.data.datasets[0].data.push(data.total);

    // manter apenas últimos 10 pontos
    if (trafficChart.data.labels.length > 10) {

        trafficChart.data.labels.shift();

        trafficChart.data.datasets[0].data.shift();

    }

    trafficChart.update();

};
