/**
 * Auth Module (Frontend Mock)
 * -------------------------------------------------------------
 * Responsabilidades:
 *  - Validar credenciales mock (admin / client) sin backend real
 *  - Persistir sesión mínima en localStorage (isLoggedIn, userRole, user)
 *  - Redirigir a páginas dedicadas: admin.html o client.html
 *  - Proveer utilidades simples (requireAuth, hasRole)
 *  - Mostrar notificaciones de estado
 *
 * Se eliminó la lógica antigua de "dashboards embebidos" (showAdminDashboard,
 * showClientDashboard, redirectToDashboard, hideAllViews) porque ahora cada
 * dashboard vive en su propio HTML independiente.
 * -------------------------------------------------------------
 */
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        // Check if user is already logged in
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const userRole = localStorage.getItem('userRole');
        
        if (isLoggedIn === 'true' && userRole) {
            this.isAuthenticated = true;
            this.currentUser = { role: userRole };
        }
    }

    login(username, password, userType) {
        console.log('=== LOGIN ATTEMPT ===');
        console.log('Username:', username);
        console.log('Password:', password);
        console.log('UserType:', userType);
        
        // CREDENCIALES HARDCODEADAS
        if (username === 'admin' && password === 'admin123' && userType === 'admin') {
            console.log('✅ ADMIN LOGIN SUCCESS');
            this.currentUser = { role: 'admin', name: 'Administrador Hotel', email: 'admin@pacificreef.com' };
            this.isAuthenticated = true;
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userRole', 'admin');
            localStorage.setItem('user', JSON.stringify(this.currentUser));
            return { success: true, role: 'admin' };
        }
        
        if (username === 'client' && password === 'client123' && userType === 'client') {
            console.log('✅ CLIENT LOGIN SUCCESS');
            this.currentUser = { role: 'client', name: 'Cliente Demo', email: 'client@pacificreef.com' };
            this.isAuthenticated = true;
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userRole', 'client');
            localStorage.setItem('user', JSON.stringify(this.currentUser));
            return { success: true, role: 'client' };
        }
        
        console.log('❌ LOGIN FAILED');
        return { success: false, message: 'Credenciales incorrectas' };
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    isLoggedIn() {
        return this.isAuthenticated;
    }

    hasRole(role) {
        return this.isLoggedIn() && this.currentUser && this.currentUser.role && this.currentUser.role.toLowerCase() === role.toLowerCase();
    }

    // Added helper methods required by dashboards
    getCurrentUser() {
        if (this.currentUser) return this.currentUser;
        try {
            const stored = localStorage.getItem('user');
            if (stored) {
                this.currentUser = JSON.parse(stored);
                return this.currentUser;
            }
        } catch (e) {
            console.warn('No se pudo parsear usuario almacenado');
        }
        return null;
    }

    requireAuth() {
        if (!this.isLoggedIn()) {
            showLoginView();
            return false;
        }
        return true;
    }

    requireRole(role) {
        if (!this.requireAuth()) return false;
        if (!this.hasRole(role)) {
            showNotification('Acceso denegado: se requiere rol ' + role, 'error');
            return false;
        }
        return true;
    }
}

// Create global auth manager instance
const authManager = new AuthManager();

// SIMPLE LOGIN HANDLER
function handleLogin() {
    console.log('🚀 INICIANDO PROCESO DE LOGIN');
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;
    
    console.log('📋 Datos capturados:', { username, password, userType });
    
    if (!username || !password || !userType) {
        showNotification('Por favor completa todos los campos', 'error');
        return false;
    }
    
    const result = authManager.login(username, password, userType);
    if (!result.success) {
        showNotification(result.message || 'Error en el inicio de sesión', 'error');
        return false;
    }

    showNotification('¡Inicio de sesión exitoso!', 'success');
    console.log('🎯 REDIRIGIENDO A PÁGINA EXTERNA:', result.role);
    setTimeout(() => {
        if (result.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'client.html';
        }
    }, 300);
    return true;
}

// Ya no se maneja vista embebida; index sólo contiene el login
function showLoginView() {
  document.title = 'Pacific Reef Hotel - Login';
}

// Notification system
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-info-circle';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 INICIALIZANDO SISTEMA DE AUTENTICACIÓN');
    
    // Setup login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin();
        });
        console.log('✅ Login form configurado');
    }
    
    // Setup logout buttons
    const logoutButtons = document.querySelectorAll('#logoutBtn, #clientLogoutBtn');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                authManager.logout();
            }
        });
    });
    
    // Check if already logged in
    if (authManager.isLoggedIn()) {
        const userRole = localStorage.getItem('userRole');
        console.log('👤 Usuario ya autenticado, redirigiendo a página dedicada:', userRole);
        window.location.href = userRole === 'admin' ? 'admin.html' : 'client.html';
    } else {
        console.log('🔓 Sin sesión activa, mostrando login');
        showLoginView();
    }
});

// Exponer sólo handleLogin para el formulario
window.handleLogin = handleLogin;