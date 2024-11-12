document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const logoutButton = document.getElementById('logoutButton');
    const messageDiv = document.getElementById('message');
    const loginStatus = document.getElementById('loginStatus');
    const userInfo = document.getElementById('userInfo');
    const usernameSpan = document.getElementById('username');
    const authForms = document.getElementById('authForms');

    function updateUIState(isLoggedIn, username = '') {
        if (isLoggedIn) {
            loginStatus.textContent = 'Logged in';
            userInfo.style.display = 'block';
            usernameSpan.textContent = username;
            authForms.style.display = 'none';
            logoutButton.style.display = 'block';
        } else {
            loginStatus.textContent = 'Not logged in';
            userInfo.style.display = 'none';
            authForms.style.display = 'block';
            logoutButton.style.display = 'none';
        }
    }

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (response.ok) {
                messageDiv.textContent = 'Registration successful! Please log in.';
                registerForm.reset();
            } else {
                messageDiv.textContent = `Registration failed: ${result.message}`;
            }
        } catch (error) {
            messageDiv.textContent = `Error: ${error.message}`;
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (response.ok) {
                messageDiv.textContent = 'Login successful! Redirecting to dashboard...';
                loginForm.reset();
                updateUIState(true, result.user.username);
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                messageDiv.textContent = `Login failed: ${result.message}`;
            }
        } catch (error) {
            messageDiv.textContent = `Error: ${error.message}`;
        }
    });

    logoutButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/auth/logout', {
                method: 'POST',
            });

            if (response.ok) {
                messageDiv.textContent = 'Logout successful!';
                updateUIState(false);
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                const result = await response.json();
                messageDiv.textContent = `Logout failed: ${result.message}`;
            }
        } catch (error) {
            messageDiv.textContent = `Error: ${error.message}`;
        }
    });

    // Check login status on page load
    fetch('/auth/check-status')
        .then(response => response.json())
        .then(data => {
            if (data.isLoggedIn) {
                updateUIState(true, data.username);
            } else {
                updateUIState(false);
            }
        })
        .catch(error => {
            console.error('Error checking login status:', error);
            updateUIState(false);
        });
});
