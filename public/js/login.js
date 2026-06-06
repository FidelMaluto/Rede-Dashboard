function login() {
    const username = document.getElementById('username').value;

    if (!username) {
        alert('Digite um nome');

        return;
    }

    localStorage.setItem('deviceName', username );

    window.location.href = './dashboard.html';
}
