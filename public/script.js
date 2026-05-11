const ws = new WebSocket(`ws://${location.host}`);

ws.onopen = () => {
    console.log('WebSocket conectado');
};

ws.onmessage = (event) => {

    const data = JSON.parse(event.data);

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
                <td class="online">${device.status}</td>
            </tr>
        `;

    });

};

ws.onerror = (err) => {
    console.log('Erro WebSocket:', err);
};
