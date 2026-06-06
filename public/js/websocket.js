const ws = new WebSocket(`ws://${location.host}`);

// PEGAR NOME
const deviceName = localStorage.getItem('deviceName') || 'Dispositivo';

// GERAR MAC
function generateFakeMac() {
    return "XX:XX:XX:XX:XX:XX"
        .replace(/X/g, () => {

            return Math.floor(Math.random() * 16).toString(16);

        });
}

// REGISTRAR
ws.onopen = () => {
    ws.send(JSON.stringify({

        type: 'register',
        deviceName,
        mac: generateFakeMac()

    }));
};

export default ws;
