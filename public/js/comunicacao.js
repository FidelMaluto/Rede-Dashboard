import ws from './websocket.js';

const deviceName = localStorage.getItem('deviceName') || 'Dispositivo';

// CHAT
function sendMessage() {

    const input =
        document.getElementById("messageInput");

    const target =
        document.getElementById("targetDevice");

    if (!input.value) return;

    ws.send(JSON.stringify({

        type: "chat",

        deviceName,

        target: target.value,

        text: input.value

    }));

    input.value = "";

}
// UPLOAD
window.uploadFile = async function () {
    const file = document.getElementById('fileInput').files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append('file', file);

    await fetch('/upload', {
        method: 'POST',
        body: formData
    });

};

// RECEBER
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "chat") {

        const messages = document.getElementById("messages");

        messages.innerHTML += `

        <div class="message">

            <strong>🔒 ${data.sender}</strong>

            <small>${data.time}</small>

            <p>${data.text}</p>

        </div>

    `;

        messages.scrollTop = messages.scrollHeight;

        return;

    }


    // Um Para um
    if (data.devices) {

        const select =
            document.getElementById("targetDevice");

        const atual = select.value;

        let totalDevices = 0;

        if (data.devices && data.devices.length !== totalDevices) {

            totalDevices = data.devices.length;

            const select = document.getElementById("targetDevice");

            select.innerHTML =
                '<option value="all">📢 Todos</option>';

            data.devices.forEach(device => {

                select.innerHTML += `
            <option value="${device.ip}">
                ${device.name} (${device.type})
            </option>
        `;

            });

        }

    });

    select.value = atual;

}

// FILES
if (data.type === 'file') {
    const uploadedFiles = document.getElementById('uploadedFiles');

    uploadedFiles.innerHTML += `
            <div class="file-item">

                <a href="/uploads/${data.filename}" target="_blank">
                    ${data.filename}
                </a>

            </div>
        `;
}
};
