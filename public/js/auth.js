class AuthManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }

    isAuthenticated() {
        return !!this.token;
    }

    getCurrentUser() {
        return this.user;
    }

    getToken() {
        return this.token;
    }

    setAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }

    async verifyToken() {
        if (!this.token) return false;

        try {
            const response = await fetch('/api/auth/check', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                return result.success;
            } else {
                this.clearAuth();
                return false;
            }
        } catch (error) {
            console.error('Error verifying token:', error);
            return false;
        }
    }

    async requireAuth() {
        if (!this.isAuthenticated()) {
            this.redirectToLogin();
            return false;
        }

        const isValid = await this.verifyToken();
        if (!isValid) {
            this.redirectToLogin();
            return false;
        }

        return true;
    }

    redirectToLogin() {
        const currentPath = window.location.pathname;
        if (currentPath !== '/login.html' && currentPath !== '/') {
            localStorage.setItem('redirectAfterLogin', currentPath);
        }
        window.location.href = '/login.html';
    }

    handleLoginSuccess() {
        const redirectPath = localStorage.getItem('redirectAfterLogin');
        localStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectPath || '/dashboard.html';
    }
}

window.authManager = new AuthManager();
