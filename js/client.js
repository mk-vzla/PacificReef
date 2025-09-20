// Client Dashboard Module
// Fallback authManager para página standalone
if (typeof authManager === 'undefined') {
    window.authManager = {
        requireAuth: () => true,
        getCurrentUser: () => {
            try { return JSON.parse(localStorage.getItem('user')) || { name:'Cliente Demo', email:'client@pacificreef.com' }; } catch { return { name:'Cliente Demo'}; }
        }
    };
}
class ClientDashboard {
    constructor() {
        this.currentSection = 'client-dashboard';
        this.data = {
            reservations: [],
            availableRooms: [],
            paymentHistory: []
        };
        this.searchParams = {};
    }

    async init() {
        if (!authManager.requireAuth()) {
            return;
        }

        this.setupNavigation();
        this.setupSearchForm();
        this.setupProfileForm();
        this.setupQuickActions();
        await this.loadDashboardData();
        this.showSection('client-dashboard');
    }

    setupNavigation() {
        const sidebarLinks = document.querySelectorAll('#clientDashboard .sidebar-menu a');
        
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
        document.querySelectorAll('#clientDashboard .content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show current section
        const section = document.getElementById(sectionName);
        if (section) {
            section.classList.add('active');
        }
        
        // Update page title
        const pageTitle = document.getElementById('clientPageTitle');
        if (pageTitle) {
            pageTitle.textContent = this.getSectionTitle(sectionName);
        }
        
        // Load section-specific data
        await this.loadSectionData(sectionName);
    }

    getSectionTitle(sectionName) {
        const titles = {
            'client-dashboard': 'Dashboard',
            'my-reservations': 'Mis Reservas',
            'payment-history': 'Historial de Pagos',
            'profile': 'Mi Perfil'
        };
        return titles[sectionName] || 'Dashboard';
    }

    async loadDashboardData() {
        try {
            // Update user info in header
            const user = authManager.getCurrentUser();
            if (user) {
                const userInfoSpan = document.querySelector('#clientDashboard .user-info span');
                const userAvatar = document.querySelector('#clientDashboard .user-avatar');
                
                if (userInfoSpan) userInfoSpan.textContent = `Bienvenido, ${user.name}`;
                if (userAvatar) userAvatar.textContent = user.name.charAt(0).toUpperCase();
            }
            
            // Load basic dashboard data (always successful with mock data)
            await this.loadMyReservations();
            
            // Update dashboard statistics
            this.updateDashboardStats();
            
            console.log('Dashboard cargado exitosamente');
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Incluso si hay errores, cargar datos de respaldo
            this.loadFallbackStats();
        }
    }

    updateDashboardStats() {
        // Calculate stats from current reservations data
        const activeReservations = this.data.reservations.filter(r => r.status === 'confirmed').length;
        const totalStays = this.data.reservations.length + 5; // Add historical stays
        const loyaltyPoints = totalStays * 150 + activeReservations * 200; // Mock calculation
        
        // Update DOM elements
        const activeCountEl = document.getElementById('activeReservationsCount');
        const totalStaysEl = document.getElementById('totalStaysCount');
        const loyaltyPointsEl = document.getElementById('loyaltyPointsCount');
        
        if (activeCountEl) activeCountEl.textContent = activeReservations;
        if (totalStaysEl) totalStaysEl.textContent = totalStays;
        if (loyaltyPointsEl) loyaltyPointsEl.textContent = loyaltyPoints.toLocaleString();
    }

    loadFallbackStats() {
        // Load fallback statistics if there are any issues
        const activeCountEl = document.getElementById('activeReservationsCount');
        const totalStaysEl = document.getElementById('totalStaysCount');
        const loyaltyPointsEl = document.getElementById('loyaltyPointsCount');
        
        if (activeCountEl) activeCountEl.textContent = '2';
        if (totalStaysEl) totalStaysEl.textContent = '8';
        if (loyaltyPointsEl) loyaltyPointsEl.textContent = '1,250';
    }

    async loadSectionData(sectionName) {
        try {
            switch (sectionName) {
                case 'my-reservations':
                    await this.loadMyReservations();
                    break;
                case 'payment-history':
                    await this.loadPaymentHistory();
                    break;
                case 'profile':
                    this.loadProfileData();
                    break;
                default:
                    // dashboard: nada extra
                    break;
            }
        } catch (error) {
            console.error(`Error al cargar datos de ${sectionName}:`, error);
            showNotification('Error al cargar los datos de la sección', 'error');
        }
    }

    setupSearchForm() {
        const searchBtn = document.getElementById('searchRoomsBtn');
        const checkInDate = document.getElementById('checkInDate');
        const checkOutDate = document.getElementById('checkOutDate');
        
        // Set default dates
        if (checkInDate && checkOutDate) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            checkInDate.value = today.toISOString().split('T')[0];
            checkOutDate.value = tomorrow.toISOString().split('T')[0];
            
            // Validate date selection
            checkInDate.addEventListener('change', () => {
                checkOutDate.min = checkInDate.value;
                if (checkOutDate.value <= checkInDate.value) {
                    const nextDay = new Date(checkInDate.value);
                    nextDay.setDate(nextDay.getDate() + 1);
                    checkOutDate.value = nextDay.toISOString().split('T')[0];
                }
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchRooms());
        }
    }

    async searchRooms() {
        const checkInDate = document.getElementById('checkInDate').value;
        const checkOutDate = document.getElementById('checkOutDate').value;
        const guests = document.getElementById('guests').value;

        if (!checkInDate || !checkOutDate) {
            showNotification('Por favor selecciona las fechas de entrada y salida', 'error');
            return;
        }

        this.searchParams = {
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests: guests
        };

        try {
            showNotification('Buscando habitaciones disponibles...', 'info');
            const response = await apiService.searchRooms(this.searchParams);
            this.data.availableRooms = response.data || [];
            this.renderFeaturedRooms();
            this.renderAvailableRooms();
            
            if (this.data.availableRooms.length === 0) {
                showNotification('No hay habitaciones disponibles para las fechas seleccionadas', 'warning');
            } else {
                showNotification(`Se encontraron ${this.data.availableRooms.length} habitaciones disponibles`, 'success');
            }
            
        } catch (error) {
            console.error('Error searching rooms:', error);
            showNotification('Error al buscar habitaciones', 'error');
        }
    }

    renderAvailableRooms() {
        const roomsGrid = document.getElementById('roomsGrid');
        if (!roomsGrid) return;

        if (this.data.availableRooms.length === 0) {
            roomsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bed"></i>
                    <h3>No hay habitaciones disponibles</h3>
                    <p>Prueba con fechas diferentes o cambia las preferencias</p>
                </div>
            `;
            return;
        }

        roomsGrid.innerHTML = this.data.availableRooms.map(room => {
            const rating = (room.rating || 4 + Math.random()).toFixed(1);
            return `
            <div class="room-card enriched">
                <div class="room-media">
                    <div class="image" style="background-image:url('https://source.unsplash.com/600x40${Math.floor(Math.random()*9)}/?hotel,room');"></div>
                    <div class="badge type">${room.type}</div>
                    <div class="badge price">$${room.price}</div>
                </div>
                <div class="room-body">
                    <div class="room-header">
                        <h3>Habitación ${room.number}</h3>
                        <div class="rating"><i class="fas fa-star"></i> ${rating}</div>
                    </div>
                    <p class="room-description">${room.description || 'Agradable habitación con todas las comodidades esenciales.'}</p>
                    <div class="room-meta">
                        <span><i class="fas fa-users"></i> Hasta ${room.capacity} huéspedes</span>
                        <span><i class="fas fa-door-open"></i> ${room.type}</span>
                    </div>
                    ${room.amenities ? `<ul class="amenities">${room.amenities.slice(0,4).map(a=>`<li><i class='fas fa-check'></i> ${a}</li>`).join('')} ${room.amenities.length>4?'<li>+ más</li>':''}</ul>`:''}
                    <div class="room-actions">
                        <button class="btn-primary" onclick="clientDashboard.bookRoom(${room.id})">Reservar Ahora</button>
                    </div>
                </div>
            </div>`;
        }).join('');
        this.renderFeaturedSuites();
    }

    renderFeaturedRooms() {
        const container = document.getElementById('featuredRooms');
        if (!container) return;
        // Seleccionar 4 habitaciones variadas (no suites; suites van en otra sección)
        let base = this.data.availableRooms.filter(r => !/suite/i.test(r.type));
        if (base.length < 4) base = this.data.availableRooms.slice();
        base = base.slice(0,4);
        if (base.length === 0) { container.innerHTML=''; return; }
        container.innerHTML = base.map(room => {
            const rating = (room.rating || (4 + Math.random()/2)).toFixed(1);
            const amenities = room.amenities ? room.amenities.slice(0,5) : ['WiFi','Aire Acondicionado','TV','Vista','Servicio'];
            return `
            <div class="featured-room-card">
              <div class="fr-media" style="background-image:url('https://source.unsplash.com/800x45${Math.floor(Math.random()*9)}/?hotel,interior,room');"></div>
              <div class="fr-body">
                <div style="display:flex; align-items:flex-start; gap:12px;">
                  <div style="flex:1;">
                    <h3>${room.type} ${room.number ? '• '+room.number : ''}</h3>
                    <p class="desc">${room.description || 'Elegante habitación con amenidades de lujo y confort.'}</p>
                    <div class="fr-top-meta"><span class="badge">${room.type}</span><div class="rating"><i class="fas fa-star"></i> ${rating}</div></div>
                    <div class="fr-meta-line"><i class="fas fa-users"></i> Hasta ${room.capacity || 2} huéspedes</div>
                    <div class="amenities-wrap">${amenities.map(a=>`<span><i class='fas fa-check'></i>${a}</span>`).join('')}</div>
                  </div>
                  <div class="price-col"><span class="amount">$${room.price}</span><span>por noche</span></div>
                </div>
                <div class="actions"><button class="btn-primary" onclick="clientDashboard.bookRoom(${room.id})">Reservar Ahora</button></div>
              </div>
            </div>`;
        }).join('');
    }

    async bookRoom(roomId) {
        const room = this.data.availableRooms.find(r => r.id === roomId);
        if (!room) return;

        const nights = this.calculateNights(this.searchParams.checkIn, this.searchParams.checkOut);
        const totalAmount = room.price * nights;

    const confirmMessage = `
Habitación: ${this.capitalizeFirst(room.type)} Nº ${room.number}
Entrada: ${this.formatDate(this.searchParams.checkIn)}
Salida: ${this.formatDate(this.searchParams.checkOut)}
Noches: ${nights}
Total: $${totalAmount}

¿Confirmar reserva?`;

        if (confirm(confirmMessage)) {
            try {
                const reservationData = {
                    roomId: room.id,
                    checkIn: this.searchParams.checkIn,
                    checkOut: this.searchParams.checkOut,
                    guests: this.searchParams.guests,
                    totalAmount: totalAmount
                };

                await apiService.createReservation(reservationData);
                showNotification('¡Reserva creada exitosamente!', 'success');
                
                // Refresh search and go to reservations
                await this.searchRooms();
                this.showSection('my-reservations');
                
            } catch (error) {
                console.error('Error al crear la reserva:', error);
                showNotification(error.message || 'Error al crear la reserva', 'error');
            }
        }
    }

    async loadMyReservations() {
        try {
            // Always use mock data - no backend calls
            const response = await apiService.getMyReservations();
            this.data.reservations = response.data || [];
            this.renderMyReservations();
            console.log('Reservas cargadas exitosamente:', this.data.reservations.length);
        } catch (error) {
            console.error('Error al cargar reservas:', error);
            // En caso de error, usar datos de ejemplo como respaldo
            this.data.reservations = [
                {
                    id: 1,
                    roomNumber: '101',
                    roomType: 'Suite Estándar',
                    checkIn: '2025-01-15',
                    checkOut: '2025-01-18',
                    totalAmount: 450.00,
                    status: 'confirmed',
                    guestName: 'Cliente Demo',
                    createdAt: '2025-01-10T10:00:00Z'
                }
            ];
            this.renderMyReservations();
        }
    }

    renderMyReservations() {
        const reservationsList = document.getElementById('clientReservationsList');
        if (!reservationsList) return;

        if (this.data.reservations.length === 0) {
            reservationsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-check"></i>
                    <h3>Aún no tienes reservas</h3>
                    <p>Comienza buscando habitaciones disponibles</p>
                    <button class="btn-primary" onclick="clientDashboard.showSection('search-rooms')">
                        Buscar Habitaciones
                    </button>
                </div>
            `;
            return;
        }

        reservationsList.innerHTML = this.data.reservations.map(reservation => `
            <div class="reservation-card">
                <div class="reservation-header">
                    <div class="reservation-id">Reserva #${reservation.id}</div>
                    <span class="status ${reservation.status} ${this.getStatusLabel(reservation.status)} ${this.getStatusLabel(reservation.status).toUpperCase()}">${this.getStatusLabel(reservation.status)}</span>
                </div>
                <div class="reservation-details">
                    <div class="detail-item">
                        <div class="detail-label">Habitación</div>
                        <div class="detail-value">${reservation.roomNumber}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Entrada</div>
                        <div class="detail-value">${this.formatDate(reservation.checkIn)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Salida</div>
                        <div class="detail-value">${this.formatDate(reservation.checkOut)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Monto Total</div>
                        <div class="detail-value">$${reservation.totalAmount}</div>
                    </div>
                </div>
                <div class="reservation-actions">
                    ${reservation.status === 'confirmed' ? `
                        <button class="btn-secondary" onclick="clientDashboard.cancelReservation(${reservation.id})">
                            Cancelar
                        </button>
                    ` : ''}
                    <button class="btn-primary" onclick="clientDashboard.viewReservationDetails(${reservation.id})">
                        Ver Detalles
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderEmptyReservations() {
        const reservationsList = document.getElementById('clientReservationsList');
        if (reservationsList) {
            reservationsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-check"></i>
                    <h3>Aún no tienes reservas</h3>
                    <p>Comienza buscando habitaciones disponibles</p>
                    <button class="btn-primary" onclick="clientDashboard.showSection('search-rooms')">
                        Buscar Habitaciones
                    </button>
                </div>
            `;
        }
    }

    async loadPaymentHistory() {
        try {
            const response = await apiService.getPaymentHistory();
            this.data.paymentHistory = response.data || [];
            this.renderPaymentHistory();
        } catch (error) {
            console.error('Error loading payment history:', error);
            this.renderEmptyPaymentHistory();
        }
    }

    renderPaymentHistory() {
        const container = document.getElementById('paymentCardsContainer');
        if (!container) return;

        if (this.data.paymentHistory.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-credit-card"></i>
                    <h3>No hay historial de pagos</h3>
                    <p>Aquí verás los pagos de tus reservas cuando existan.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.data.paymentHistory.map(payment => `
            <div class="payment-card">
                <div class="payment-header">
                    <div class="payment-id">Pago #${payment.id}</div>
                    <span class="status ${payment.status} ${this.getStatusLabel(payment.status)} ${this.getStatusLabel(payment.status).toUpperCase()}">${this.getStatusLabel(payment.status)}</span>
                </div>
                <div class="payment-details">
                    <div class="detail-item">
                        <div class="detail-label">Fecha</div>
                        <div class="detail-value">${this.formatDate(payment.date)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Reserva</div>
                        <div class="detail-value">#${payment.reservationId}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Monto</div>
                        <div class="detail-value">$${payment.amount}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Método</div>
                        <div class="detail-value">${payment.method}</div>
                    </div>
                </div>
                <div class="payment-actions">
                    ${payment.status === 'pending' ? `
                        <button class="btn-primary" onclick="clientDashboard.payPending(${payment.id})">Pagar</button>
                    ` : `
                        <button class="btn-secondary" onclick="clientDashboard.viewPaymentDetails(${payment.id})">Ver Detalles</button>
                    `}
                </div>
            </div>
        `).join('');
    }

    renderEmptyPaymentHistory() {
        const container = document.getElementById('paymentCardsContainer');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-credit-card"></i>
                    <h3>No hay historial de pagos</h3>
                    <p>Aquí verás los pagos de tus reservas cuando existan.</p>
                </div>`;
        }
    }

    setupProfileForm() {
        const profileForm = document.getElementById('profileForm');
        const changePasswordBtn = document.getElementById('changePasswordBtn');

        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileSubmit(e));
        }

        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => this.showChangePasswordModal());
        }
    }

    loadProfileData() {
        const user = authManager.getCurrentUser();
        if (!user) return;

        // Pre-fill form with user data
        const form = document.getElementById('profileForm');
        if (form) {
            const [firstName, lastName] = (user.name || '').split(' ');
            form.firstName.value = firstName || '';
            form.lastName.value = lastName || '';
            form.email.value = user.email || '';
            // Other fields would be loaded from a more complete user profile
        }
    }

    async handleProfileSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const profileData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address')
        };

        try {
            // In a real implementation, this would call apiService.updateProfile()
            showNotification('¡Perfil actualizado exitosamente!', 'success');
            
            // Update local user data
            const user = authManager.getCurrentUser();
            user.name = `${profileData.firstName} ${profileData.lastName}`;
            user.email = profileData.email;
            localStorage.setItem('user', JSON.stringify(user));
            
        } catch (error) {
            console.error('Error updating profile:', error);
            showNotification('Error al actualizar el perfil', 'error');
        }
    }

    setupQuickActions() {
        const quickActionBtns = document.querySelectorAll('.quick-actions .action-btn');
        
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                if (action) {
                    this.showSection(action);
                }
            });
        });
    }

    // Action handlers
    async cancelReservation(reservationId) {
        if (confirm('¿Seguro que deseas cancelar esta reserva?')) {
            try {
                await apiService.cancelReservation(reservationId);
                showNotification('Reserva cancelada correctamente', 'success');
                await this.loadMyReservations();
            } catch (error) {
                console.error('Error al cancelar la reserva:', error);
                showNotification('Error al cancelar la reserva', 'error');
            }
        }
    }

    viewReservationDetails(reservationId) {
        const reservation = this.data.reservations.find(r => r.id === reservationId);
        if (reservation) {
            // Show detailed reservation modal (to be implemented)
            alert(`Detalles de la Reserva:\n\nID: ${reservation.id}\nHabitación: ${reservation.roomNumber}\nEntrada: ${this.formatDate(reservation.checkIn)}\nSalida: ${this.formatDate(reservation.checkOut)}\nTotal: $${reservation.totalAmount}\nEstado: ${this.getStatusLabel(reservation.status)}`);
        }
    }

    viewPaymentDetails(paymentId) {
        const payment = this.data.paymentHistory.find(p => p.id === paymentId);
        if (payment) {
            // Show payment details modal (to be implemented)
            alert(`Detalles del Pago:\n\nID: ${payment.id}\nFecha: ${this.formatDate(payment.date)}\nMonto: $${payment.amount}\nMétodo: ${payment.method}\nEstado: ${this.getStatusLabel(payment.status)}`);
        }
    }

    showChangePasswordModal() {
        // Show change password modal (to be implemented)
        alert('La funcionalidad de cambio de contraseña será implementada próximamente');
    }

    // Utility methods
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    getStatusLabel(status) {
        const map = {
            confirmed: 'confirmada',
            pending: 'pendiente',
            cancelled: 'cancelada',
            canceled: 'cancelada', // por si acaso
            completed: 'completado',
            failed: 'fallido',
            refunded: 'reembolsado'
        };
        return map[status] || this.capitalizeFirst(status);
    }

    async payPending(paymentId) {
        // Simula pago y actualiza estado
        const payment = this.data.paymentHistory.find(p => p.id === paymentId);
        if (!payment) return;
        if (payment.status !== 'pending') return;
        try {
            showNotification('Procesando pago...', 'info');
            await new Promise(r => setTimeout(r, 800));
            payment.status = 'completed';
            showNotification('Pago completado', 'success');
            this.renderPaymentHistory();
        } catch (e) {
            showNotification('Error al procesar el pago', 'error');
        }
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    calculateNights(checkIn, checkOut) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    renderFeaturedSuites() {
        const container = document.getElementById('featuredSuites');
        if (!container) return;
        // buscar suites actuales
        let suites = this.data.availableRooms.filter(r => /suite/i.test(r.type));
        if (suites.length < 4) {
            const deluxeExtras = this.data.availableRooms.filter(r => /deluxe/i.test(r.type) && !suites.includes(r));
            suites = suites.concat(deluxeExtras);
        }
        // si todavía faltan, crear mock suites basadas en cualquier habitación
        const needed = 4 - suites.length;
        if (needed > 0) {
            const baseRooms = this.data.availableRooms.slice(0, needed);
            const startId = Date.now();
            const generated = baseRooms.map((br, idx) => ({
                id: startId + idx,
                number: `S${100+idx}`,
                type: 'Suite Premium',
                capacity: br.capacity || 2,
                price: (br.price || 120) + 80,
                description: 'Suite generada dinámicamente para destacar lujo y confort.',
                amenities: ['Vista al mar','WiFi','Mini Bar','Smart TV','Jacuzzi']
            }));
            suites = suites.concat(generated);
        }
        suites = suites.slice(0,4);
        container.innerHTML = `
            <h3 class="featured-title">Suites Destacadas</h3>
            <div class="featured-grid">
                ${suites.map(s => `
                <div class="suite-card">
                    <div class="suite-media" style="background-image:url('https://source.unsplash.com/400x30${Math.floor(Math.random()*9)}/?resort,suite,hotel');">
                        <div class="suite-badge">${s.type}</div>
                    </div>
                    <div class="suite-body">
                        <h4>Suite ${s.number}</h4>
                        <div class="suite-meta"><span><i class="fas fa-users"></i> ${s.capacity} huéspedes</span><span><i class="fas fa-dollar-sign"></i> $${s.price}/noche</span></div>
                        <p>${s.description || 'Experiencia premium con comodidades exclusivas.'}</p>
                        <button class="btn-secondary" onclick="clientDashboard.bookRoom(${s.id})">Reservar</button>
                    </div>
                </div>`).join('')}
            </div>
        `;
    }
}

// Create global client dashboard instance
const clientDashboard = new ClientDashboard();

// Initialize client dashboard
function initializeClientDashboard() {
    clientDashboard.init();
}

// Make functions globally available for onclick handlers
window.clientDashboard = clientDashboard;