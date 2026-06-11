import ws from './websocket.js';

const deviceName = localStorage.getItem('deviceName') || 'Dispositivo';

// CHAT
window.sendMessage = function () {
    const input =
        document.getElementById('messageInput');

    if (!input.value) return;

    ws.send(JSON.stringify({
        type: 'chat',
        deviceName: deviceName,
        text: input.value
    }));

    input.value = '';

};

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

    // CHAT
    if (data.type === 'chat') {
        const messages = document.getElementById('messages');

        messages.innerHTML += `
            <div class="message">

                <strong> ${data.sender} </strong>
                <p>${data.text}</p>

            </div>
        `;
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
