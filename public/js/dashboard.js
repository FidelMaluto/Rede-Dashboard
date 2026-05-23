import ws from './websocket.js';

const ctx =
    document.getElementById('trafficChart');

const trafficChart = new Chart(ctx, {

    type: 'line',

    data: {

        labels: [],

        datasets: [{

            label: 'Dispositivos',

            data: [],

            borderColor: '#38bdf8',

            tension: 0.4

        }]

    }

});

ws.onmessage = (event) => {

    const data =
        JSON.parse(event.data);

    if (data.type) return;

    document.getElementById(
        'serverIP'
    ).innerText = data.serverIP;

    document.getElementById(
        'total'
    ).innerText = data.total;

    document.getElementById(
        'time'
    ).innerText = data.time;

    const tbody =
        document.getElementById(
            'devices'
        );

    tbody.innerHTML = '';

    data.devices.forEach(device => {

        tbody.innerHTML += `

            <tr>

                <td>${device.name}</td>

                <td>${device.ip}</td>

                <td>${device.mac}</td>

                <td class="online">
                    ${device.status}
                </td>

            </tr>

        `;

    });

    trafficChart.data.labels.push(
        data.time
    );

    trafficChart.data.datasets[0]
        .data.push(data.total);

    if (
        trafficChart.data.labels.length > 10
    ) {

        trafficChart.data.labels.shift();

        trafficChart.data.datasets[0]
            .data.shift();

    }

    trafficChart.update();

};
