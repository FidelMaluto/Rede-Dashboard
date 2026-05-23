function login() {

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Preencha todos campos');
        return;
    }

    localStorage.setItem('username', username);

    window.location.href = 'admin.html';
}
