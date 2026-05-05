const ws = new WebSocket(`ws://${location.host}`);

ws.onopen = () => {
    console.log("WebSocket conectado");
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // hora
    document.getElementById('time').innerText = data.time;

    // total dispositivos
    document.getElementById('total').innerText = data.total;

    // tabela
    const tbody = document.getElementById('devices');
    tbody.innerHTML = '';

    data.devices.forEach(device => {
        const row = `
            <tr>
                <td>${device.name}</td>
                <td>${device.ip}</td>
                <td>${device.status}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
};

ws.onerror = (err) => {
    console.log("Erro WebSocket:", err);
};
