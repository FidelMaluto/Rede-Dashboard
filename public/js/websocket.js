const ws = new WebSocket(`ws://${location.host}`);

// PEGAR NOME
const savedName = localStorage.getItem("deviceName");

const deviceName = savedName || getDeviceType();

// GERAR MAC
function generateFakeMac() {
    return "XX:XX:XX:XX:XX:XX".replace(/X/g, () => {

            return Math.floor(Math.random() * 16).toString(16);

        });
}

// PEGAR O NOME DO DISPOSITIVO
function getDeviceType() {

    const ua = navigator.userAgent.toLowerCase();

    if (ua.includes("android")) return "Android";

    if (ua.includes("iphone")) return "iPhone";

    if (ua.includes("ipad")) return "iPad";

    if (ua.includes("windows")) return "Windows PC";

    if (ua.includes("mac")) return "MacBook";

    if (ua.includes("linux")) return "Linux";

    return "Dispositivo";
}

// REGISTRAR
ws.onopen = () => {

    ws.send(JSON.stringify({

        type: 'register',
        deviceName: localStorage.getItem('deviceName'),
        deviceType: getDeviceType(),
        mac: generateFakeMac()

    }));

};

export default ws;
