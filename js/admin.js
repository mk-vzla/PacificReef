// Admin Dashboard Module
// Fallback authManager para página standalone
if (typeof authManager === 'undefined') {
    window.authManager = {
        requireRole: (role) => {
            const storedRole = localStorage.getItem('userRole');
            return storedRole === 'admin';
        }
    };
}
class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.data = {
            rooms: [],
            reservations: [],
            users: [],
            stats: {}
        };
        this.filters = {
            rooms: {},
            reservations: {},
            users: {}
        };
    }

    async init() {
        if (!authManager.requireRole('admin')) {
            return;
        }

        this.setupNavigation();
        this.setupModals();
        this.setupFilters();
        await this.loadDashboardData();
        this.showSection('dashboard');
    }

    setupNavigation() {
        const sidebarLinks = document.querySelectorAll('#adminDashboard .sidebar-menu a');
        
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
                
                // Update active link
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    async showSection(sectionName) {
        this.currentSection = sectionName;
        
        // Hide all sections
        document.querySelectorAll('#adminDashboard .content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show current section
        const section = document.getElementById(sectionName);
        if (section) {
            section.classList.add('active');
        }
        
        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = this.getSectionTitle(sectionName);
        }
        
        // Load section-specific data
        await this.loadSectionData(sectionName);
    }

    getSectionTitle(sectionName) {
        const titles = {
            'dashboard': 'Dashboard',
            'rooms': 'Gestión de Habitaciones',
            'reservations': 'Gestión de Reservas',
            'users': 'Gestión de Usuarios',
            'reports': 'Reportes y Analítica'
        };
        return titles[sectionName] || 'Dashboard';
    }

    async loadDashboardData() {
        try {
            showLoading();
            this.data.stats = await apiService.getDashboardStats();
            this.updateDashboardStats();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            showNotification('Error al cargar datos del tablero', 'error');
        } finally {
            hideLoading();
        }
    }

    async loadSectionData(sectionName) {
        try {
            switch (sectionName) {
                case 'rooms':
                    await this.loadRooms();
                    break;
                case 'reservations':
                    await this.loadReservations();
                    break;
                case 'users':
                    await this.loadUsers();
                    break;
                case 'reports':
                    await this.loadReports();
                    break;
            }
        } catch (error) {
            console.error(`Error loading ${sectionName} data:`, error);
            showNotification(`Error al cargar datos de ${this.getSectionTitle(sectionName)}`, 'error');
        }
    }

    updateDashboardStats() {
        const stats = this.data.stats;
        
        // Update stat cards
        document.querySelector('.stat-card:nth-child(1) .stat-number').textContent = stats.totalRooms || '0';
        document.querySelector('.stat-card:nth-child(2) .stat-number').textContent = stats.activeReservations || '0';
        document.querySelector('.stat-card:nth-child(3) .stat-number').textContent = stats.totalGuests || '0';
        document.querySelector('.stat-card:nth-child(4) .stat-number').textContent = 
            stats.monthlyRevenue ? `$${stats.monthlyRevenue.toLocaleString()}` : '$0';
    }

    async loadRooms() {
        try {
            const response = await apiService.getRooms(this.filters.rooms);
            this.data.rooms = response.data || [];
            this.renderRoomsTable();
        } catch (error) {
            console.error('Error loading rooms:', error);
            this.renderEmptyState('rooms', 'No hay habitaciones');
        }
    }

    renderRoomsTable() {
        const tbody = document.getElementById('roomsTableBody');
        if (!tbody) return;

        if (this.data.rooms.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay habitaciones</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.rooms.map(room => `
            <tr>
                <td>${room.number}</td>
                <td>${this.capitalizeFirst(room.type)}</td>
                <td>$${room.price}/night</td>
                <td><span class="status ${room.status}">${this.capitalizeFirst(room.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="adminDashboard.editRoom(${room.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="action-btn delete" onclick="adminDashboard.deleteRoom(${room.id})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadReservations() {
        try {
            const response = await apiService.getReservations(this.filters.reservations);
            this.data.reservations = response.data || [];
            this.renderReservationsTable();
        } catch (error) {
            console.error('Error loading reservations:', error);
            this.renderEmptyState('reservations', 'No hay reservas');
        }
    }

    renderReservationsTable() {
        const tbody = document.getElementById('reservationsTableBody');
        if (!tbody) return;

        if (this.data.reservations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay reservas</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.reservations.map(reservation => `
            <tr>
                <td>#${reservation.id}</td>
                <td>${reservation.guestName}</td>
                <td>${reservation.roomNumber}</td>
                <td>${this.formatDate(reservation.checkIn)}</td>
                <td>${this.formatDate(reservation.checkOut)}</td>
                <td><span class="status ${reservation.status}">${this.capitalizeFirst(reservation.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="adminDashboard.viewReservation(${reservation.id})">
                            <i class="fas fa-eye"></i> Ver
                        </button>
                        <button class="action-btn edit" onclick="adminDashboard.editReservation(${reservation.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadUsers() {
        try {
            const response = await apiService.getUsers(this.filters.users);
            this.data.users = response.data || [];
            this.renderUsersTable();
        } catch (error) {
            console.error('Error loading users:', error);
            this.renderEmptyState('users', 'No hay usuarios');
        }
    }

    renderUsersTable() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        if (this.data.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay usuarios</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.users.map(user => `
            <tr>
                <td>#${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="tag ${user.role}">${this.capitalizeFirst(user.role)}</span></td>
                <td><span class="status ${user.status}">${this.capitalizeFirst(user.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="adminDashboard.editUser(${user.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="action-btn delete" onclick="adminDashboard.deleteUser(${user.id})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadReports() {
        // This will be implemented with chart libraries and Python analytics integration
        console.log('Cargando reportes y analítica...');
    }

    // Modal management
    setupModals() {
        // Room modal
        const roomModal = document.getElementById('roomModal');
        const addRoomBtn = document.getElementById('addRoomBtn');
        const cancelRoomBtn = document.getElementById('cancelRoomBtn');
        const closeBtn = roomModal?.querySelector('.close-btn');
        const roomForm = document.getElementById('roomForm');

        if (addRoomBtn) {
            addRoomBtn.addEventListener('click', () => this.showRoomModal());
        }

        if (cancelRoomBtn) {
            cancelRoomBtn.addEventListener('click', () => this.hideRoomModal());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideRoomModal());
        }

        if (roomForm) {
            roomForm.addEventListener('submit', (e) => this.handleRoomFormSubmit(e));
        }

        // Close modal when clicking outside
        if (roomModal) {
            roomModal.addEventListener('click', (e) => {
                if (e.target === roomModal) {
                    this.hideRoomModal();
                }
            });
        }
    }

    showRoomModal(roomData = null) {
        const modal = document.getElementById('roomModal');
        const form = document.getElementById('roomForm');
        const title = document.getElementById('roomModalTitle');
        
        if (!modal || !form) return;

        // Reset form
        form.reset();
        
        if (roomData) {
            // Edit mode
            title.textContent = 'Edit Room';
            form.roomNumber.value = roomData.number;
            form.roomType.value = roomData.type;
            form.price.value = roomData.price;
            form.status.value = roomData.status;
            form.dataset.roomId = roomData.id;
        } else {
            // Add mode
            title.textContent = 'Add New Room';
            delete form.dataset.roomId;
        }

        modal.classList.add('active');
    }

    hideRoomModal() {
        const modal = document.getElementById('roomModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    async handleRoomFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const roomData = {
            number: formData.get('roomNumber'),
            type: formData.get('roomType'),
            price: parseFloat(formData.get('price')),
            status: formData.get('status')
        };

        try {
            if (form.dataset.roomId) {
                // Update existing room
                await apiService.updateRoom(form.dataset.roomId, roomData);
                showNotification('Room updated successfully', 'success');
            } else {
                // Create new room
                await apiService.createRoom(roomData);
                showNotification('Room created successfully', 'success');
            }
            
            this.hideRoomModal();
            await this.loadRooms(); // Refresh the table
            
        } catch (error) {
            console.error('Error saving room:', error);
            showNotification(error.message || 'Error saving room', 'error');
        }
    }

    // Filter management
    setupFilters() {
        // Room filters
        const roomSearch = document.getElementById('roomSearch');
        const roomTypeFilter = document.getElementById('roomTypeFilter');
        const roomStatusFilter = document.getElementById('roomStatusFilter');

        if (roomSearch) {
            roomSearch.addEventListener('input', this.debounce(() => {
                this.filters.rooms.search = roomSearch.value;
                this.loadRooms();
            }, 300));
        }

        if (roomTypeFilter) {
            roomTypeFilter.addEventListener('change', () => {
                this.filters.rooms.type = roomTypeFilter.value;
                this.loadRooms();
            });
        }

        if (roomStatusFilter) {
            roomStatusFilter.addEventListener('change', () => {
                this.filters.rooms.status = roomStatusFilter.value;
                this.loadRooms();
            });
        }

        // Similar setup for reservation and user filters...
    }

    // Action handlers
    async editRoom(roomId) {
        const room = this.data.rooms.find(r => r.id === roomId);
        if (room) {
            this.showRoomModal(room);
        }
    }

    async deleteRoom(roomId) {
        if (confirm('Are you sure you want to delete this room?')) {
            try {
                await apiService.deleteRoom(roomId);
                showNotification('Room deleted successfully', 'success');
                await this.loadRooms();
            } catch (error) {
                console.error('Error deleting room:', error);
                showNotification(error.message || 'Error deleting room', 'error');
            }
        }
    }

    async viewReservation(reservationId) {
        const reservation = this.data.reservations.find(r => r.id === reservationId);
        if (reservation) {
            // Show reservation details modal (to be implemented)
            console.log('View reservation:', reservation);
        }
    }

    async editReservation(reservationId) {
        const reservation = this.data.reservations.find(r => r.id === reservationId);
        if (reservation) {
            // Show edit reservation modal (to be implemented)
            console.log('Edit reservation:', reservation);
        }
    }

    async editUser(userId) {
        const user = this.data.users.find(u => u.id === userId);
        if (user) {
            // Show edit user modal (to be implemented)
            console.log('Edit user:', user);
        }
    }

    async deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await apiService.deleteUser(userId);
                showNotification('User deleted successfully', 'success');
                await this.loadUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                showNotification(error.message || 'Error deleting user', 'error');
            }
        }
    }

    // Utility methods
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    renderEmptyState(section, message) {
        const tbody = document.getElementById(`${section}TableBody`);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="100%" class="text-center">${message}</td></tr>`;
        }
    }
}

// Loading and error utilities
function showLoading() {
    // Add loading spinner to main content
    const contentArea = document.querySelector('#adminDashboard .content-area');
    if (contentArea && !contentArea.querySelector('.loading-overlay')) {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i> Cargando...</div>';
        contentArea.appendChild(loadingOverlay);
    }
}

function hideLoading() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

// Create global admin dashboard instance
const adminDashboard = new AdminDashboard();

// Initialize admin dashboard
function initializeAdminDashboard() {
    adminDashboard.init();
}

// Make functions globally available for onclick handlers
window.adminDashboard = adminDashboard;