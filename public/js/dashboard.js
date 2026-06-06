import ws from './websocket.js';

const ctx = document.getElementById('trafficChart');

const trafficChart = new Chart(ctx, {

    type: 'line',
    data: {
        labels: [],
        datasets: [{

            label: 'Atividade da Rede',
            data: [],
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56,189,248,0.15)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4

        }]
    },

    options: {
        responsive: true,

        plugins: {

            legend: {
                labels: {
                    color: 'white'
                }
            }

        },

        scales: {
            x: {
                ticks: {
                    color: '#94a3b8'
                },
                grid: {
                    color: '#1e293b'
                }
            },

            y: {
                ticks: {
                    color: '#94a3b8'
                },
                grid: {
                    color: '#1e293b'
                },
                beginAtZero: true
            }
        }
    }

});

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'chat' || data.type === 'file') {
        return;
    }

    document.getElementById('serverIP').innerText = data.serverIP;
    document.getElementById('total').innerText = data.total;
    document.getElementById('time').innerText = data.time;

    const tbody = document.getElementById('devices');

    tbody.innerHTML = '';

    data.devices.forEach(device => {
        tbody.innerHTML += `
            <tr>
                <td>${device.name}</td>
                <td>${device.ip}</td>
                <td>${device.mac}</td>
                <td class="online"> ${device.status}</td>
            </tr>
             `;
    });

    trafficChart.data.labels.push(data.time);

    trafficChart.data.datasets[0]
        .data.push(data.total + Math.random() * 2);

    if (trafficChart.data.labels.length > 10) {

        trafficChart.data.labels.shift();

        trafficChart.data.datasets[0].data.shift();

    }

    trafficChart.update();

};
