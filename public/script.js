const ws = new WebSocket(`ws://${location.host}`);

function getDeviceName() {

    const userAgent = navigator.userAgent;

    if (/android/i.test(userAgent)) {
        return 'Android';
    }

    if (/iphone/i.test(userAgent)) {
        return 'iPhone';
    }

    if (/windows/i.test(userAgent)) {
        return 'Windows PC';
    }

    if (/mac/i.test(userAgent)) {
        return 'MacBook';
    }

    return 'Dispositivo';
}

ws.onopen = () => {

    ws.send(JSON.stringify({
        type: 'register',
        deviceName: getDeviceName()
    }));

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
                <td>${device.status}</td>
            </tr>
        `;

    });

};
