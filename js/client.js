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
            availableRooms: []
        };
        this.searchParams = {};
    this.reservationsFilter = 'pending';
        // Dataset fijo para precarga inmediata
        this.initialMockRooms = [
            {
                id: '1',
                name: 'Suite Premium',
                type: 'suite',
                price: 450,
                capacity: 4,
                rating: 4.9,
                available: true,
                image: 'https://images.unsplash.com/photo-1590490359854-dfba19688d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHN1aXRlJTIwYmVkcm9vbXxlbnwxfHx8fDE3NTgyNjgwMDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
                amenities: ['WiFi', 'Estacionamiento', 'Aire Acondicionado', 'Bañera Jacuzzi', 'Vista al Mar'],
                description: 'Elegante suite con vista panorámica al océano y amenidades de lujo'
            },
            {
                id: '2',
                name: 'Habitación Deluxe',
                type: 'deluxe',
                price: 280,
                capacity: 2,
                rating: 4.6,
                available: true,
                image: 'https://images.unsplash.com/photo-1509647924673-bbb53e22eeb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMHJvb20lMjBkZWx1eGV8ZW58MXx8fHwxNzU4MzQyNjAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
                amenities: ['WiFi', 'Estacionamiento', 'Aire Acondicionado', 'Minibar'],
                description: 'Habitación moderna y confortable con todas las comodidades'
            },
            {
                id: '3',
                name: 'Habitación Standard',
                type: 'standard',
                price: 180,
                capacity: 2,
                rating: 4.3,
                available: false,
                image: 'https://images.unsplash.com/photo-1648766378129-11c3d8d0da05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHN0YW5kYXJkJTIwcm9vbSUyMGJlZHxlbnwxfHx8fDE3NTgzNDI2MDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
                amenities: ['WiFi', 'Aire Acondicionado', 'TV Cable'],
                description: 'Habitación cómoda con las amenidades esenciales para una estadía placentera'
            },
            {
                id: '4',
                name: 'Villa Familiar',
                type: 'villa',
                price: 650,
                capacity: 6,
                rating: 4.8,
                available: true,
                image: 'https://images.unsplash.com/photo-1757839609911-d15795147a40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHZpbGxhJTIwZmFtaWx5JTIwcmVzb3J0fGVufDF8fHx8MTc1ODM0MjYwN3ww&ixlib=rb-4.1.0&q=80&w=1080',
                amenities: ['WiFi', 'Estacionamiento', 'Piscina Privada', 'Cocina Completa', 'Acceso a Playa'],
                description: 'Villa exclusiva con acceso directo a la playa y todas las comodidades familiares'
            }
        ];
    }

    async init() {
        if (!authManager.requireAuth()) {
            return;
        }

        this.setupNavigation();
        this.setupSearchForm();
        this.setupProfileForm();
        this.setupQuickActions();
    this.setupReservationFilters();
        await this.loadDashboardData();
        // Precarga: usar solo mock local para las destacadas y NO poblar listado general
        this.data.availableRooms = this.initialMockRooms.slice();
        this.renderFeaturedRooms(true); // modo inicial
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
            // Listeners para tarjetas de acción
            const actionCards = document.querySelectorAll('#clientPrimaryActions .action-card');
            actionCards.forEach(card => {
                card.addEventListener('click', () => {
                    const target = card.getAttribute('data-target');
                    if (target === 'client-dashboard') return; // ya está
                    this.showSection(target);
                    // marcar menú lateral
                    const link = document.querySelector(`#clientDashboard .sidebar-menu a[data-section='${target}']`);
                    if (link) {
                        document.querySelectorAll('#clientDashboard .sidebar-menu a').forEach(l=>l.classList.remove('active'));
                        link.classList.add('active');
                    }
                });
            });
            
            console.log('Dashboard cargado exitosamente');
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Incluso si hay errores, cargar datos de respaldo
            this.loadFallbackStats();
        }
    }

    updateDashboardStats() {
        const activeReservations = this.data.reservations.filter(r => r.status === 'confirmed').length;
        const activeCountEl = document.getElementById('activeReservationsCount');
        if (activeCountEl) activeCountEl.textContent = activeReservations;
        const profileCompletion = document.getElementById('profileCompletion');
        if (profileCompletion) profileCompletion.textContent = '100%';
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

    renderAvailableRooms(isPreload=false) {
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

                // En modo inicial no mostrar grid (solo suites destacadas). Mostrar grid solo tras una búsqueda real.
                if (isPreload) { roomsGrid.innerHTML=''; return; }
                roomsGrid.innerHTML = this.data.availableRooms.map(room => {
                        const rating = (room.rating || (4 + Math.random()/2)).toFixed(1);
                        const available = room.status ? /available|disponible|true/i.test(room.status.toString()) : room.available !== false;
                        const displayName = room.name || `${this.capitalizeFirst(room.type)}${room.number? ' '+room.number:''}`;
                        const capacity = room.capacity || 2;
                        const amenities = room.amenities || [];
                        return `
                        <div class="room-card enriched ${!available? 'not-available':''}">
                            <div class="room-media">
                                <div class="image" style="background-image:url('https://source.unsplash.com/600x40${Math.floor(Math.random()*9)}/?hotel,room,luxury');"></div>
                                ${!available? '<div class="overlay-unavailable">No Disponible</div>':''}
                            </div>
                            <div class="room-body">
                                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
                                    <div style="flex:1;">
                                        <h3>${displayName}</h3>
                                        <p class="room-description">${room.description || 'Habitación cómoda con las amenidades esenciales para una estadía placentera'}</p>
                                        <div class="fr-top-meta"><span class="badge">${room.type}</span><div class="rating"><i class="fas fa-star"></i> ${rating}</div></div>
                                        <div class="fr-meta-line"><i class="fas fa-users"></i> Hasta ${capacity} huéspedes</div>
                                        ${amenities.length? `<div class="amenities-wrap">${amenities.map(a=>`<span><i class='fas fa-check'></i>${a}</span>`).join('')}</div>`:''}
                                    </div>
                                    <div class="price-col"><span class="amount">$${room.price}</span><span>por noche</span></div>
                                </div>
                                <div class="actions"><button class="btn-primary" ${!available? 'disabled':''} onclick="clientDashboard.bookRoom(${room.id})">${available? 'Reservar Ahora':'No Disponible'}</button></div>
                            </div>
                        </div>`;
                }).join('');
        this.renderFeaturedSuites();
    }

        renderFeaturedRooms(initial=false) {
                const container = document.getElementById('featuredRooms');
                if (!container) return;
                const base = this.initialMockRooms.slice(0,4);
                container.innerHTML = base.map(room => {
                        const rating = room.rating.toFixed ? room.rating.toFixed(1) : room.rating;
                        return `
                        <div class="featured-room-card">
                            <div class="fr-media" style="background-image:url('${room.image}');"></div>
                            <div class="fr-body">
                                <div style="display:flex; align-items:flex-start; gap:12px;">
                                    <div style="flex:1;">
                                        <h3>${room.name}</h3>
                                        <p class="desc">${room.description}</p>
                                        <div class="fr-top-meta"><span class="badge">${room.type}</span><div class="rating"><i class="fas fa-star"></i> ${rating}</div></div>
                                        <div class="fr-meta-line"><i class="fas fa-users"></i> Hasta ${room.capacity} huéspedes</div>
                                        <div class="amenities-wrap">${room.amenities.map(a=>`<span><i class='fas fa-check'></i>${a}</span>`).join('')}</div>
                                    </div>
                                    <div class="price-col"><span class="amount">$${room.price}</span><span>por noche</span></div>
                                </div>
                                <div class="actions"><button class="btn-primary" ${room.available? '' : 'disabled'} onclick="clientDashboard.bookRoom('${room.id}')">${room.available? 'Reservar Ahora':'No Disponible'}</button></div>
                            </div>
                        </div>`;
                }).join('');
                if (initial) {
                        // Limpiar suites secundarias para evitar duplicado
                        const suites = document.getElementById('featuredSuites');
                        if (suites) suites.innerHTML='';
                }
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
            // Obtener todas las reservas (sin filtrar) para replicar numeración global usada en admin
            const response = await apiService.getReservations();
            const currentUser = authManager.getCurrentUser();
            const all = response.data || [];
            // Orden global cronológico por checkIn ascendente (igual que admin antes de generar códigos)
            const chronSorted = [...all].sort((a,b)=> new Date(a.checkIn) - new Date(b.checkIn));
            const year = new Date().getFullYear();
            const codeMap = new Map();
            chronSorted.forEach((r,idx)=>{
                codeMap.set(r.id, `PR-${year}-${String(idx+1).padStart(3,'0')}`);
            });
            // Filtrar sólo reservas del usuario actual
            const mine = chronSorted.filter(r => currentUser && ((r.userName && r.userName.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0])) || r.userId === currentUser.id));
            // Mapear agregando código existente del map y normalizando estado
            const withCodes = mine.map(r => ({
                ...r,
                prCode: codeMap.get(r.id),
                status: this.normalizeStatus(r.status)
            }));
            // Mostrar en orden descendente por código (más reciente primero)
            this.data.reservations = withCodes.sort((a,b)=> b.prCode.localeCompare(a.prCode));
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

        let list = [...this.data.reservations];
        if (this.reservationsFilter && this.reservationsFilter !== 'all') {
            list = list.filter(r => r.status === this.reservationsFilter);
        }
        if (list.length === 0) {
            reservationsList.innerHTML = `<div class="empty-state"><i class="fas fa-calendar-check"></i><h3>No hay reservas ${this.reservationsFilter==='all'?'registradas':('en estado '+this.getStatusLabel(this.reservationsFilter))}</h3><p>Cambia el filtro para ver otras reservas.</p></div>`;
            return;
        }
        reservationsList.innerHTML = list.map(reservation => {
            // Simulación: si estado es Pendiente o Confirmada definimos pago pendiente/completado
            const paymentStatus = /(pendiente|pending)/i.test(reservation.status) ? 'pending' : 'completed';
            const paymentLabel = paymentStatus === 'pending' ? 'Pago Pendiente' : 'Pago Completado';
            return `
            <div class="reservation-card">
                <div class="reservation-header">
                    <div class="reservation-id">${reservation.prCode || ('Reserva #'+reservation.id)}</div>
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
                    <div class="detail-item">
                        <div class="detail-label">Pago</div>
                        <div class="detail-value ${paymentStatus}">${paymentLabel}</div>
                    </div>
                </div>
                <div class="reservation-actions">
                    ${paymentStatus === 'pending' ? `
                        <button class="btn-pay" onclick="clientDashboard.simulatePay(${reservation.id})">Pagar</button>
                        <button class="btn-annul" onclick="clientDashboard.cancelReservation(${reservation.id})">Anular</button>
                    ` : (reservation.status === 'confirmed' ? `
                        <button class="btn-annul" onclick="clientDashboard.cancelReservation(${reservation.id})">Anular</button>
                    ` : '')}
                    <button class="btn-primary" onclick="clientDashboard.viewReservationDetails(${reservation.id})">Ver Detalles</button>
                </div>
            </div>
        `; }).join('');
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
            // Campos extendidos almacenados
            try {
                const extended = JSON.parse(localStorage.getItem('profileExtended')||'{}');
                if (extended.phone) form.phone.value = extended.phone;
                if (extended.address) form.address.value = extended.address;
                if (extended.birthDate) form.birthDate.value = extended.birthDate;
                if (extended.city) form.city.value = extended.city;
                if (extended.country) form.country.value = extended.country;
                const notifEmailToggle = document.getElementById('notifEmailToggle');
                if (notifEmailToggle && typeof extended.notifEmail !== 'undefined') notifEmailToggle.checked = !!extended.notifEmail;
                const twoFactorToggle = document.getElementById('twoFactorToggle');
                if (twoFactorToggle && typeof extended.twoFactor !== 'undefined') twoFactorToggle.checked = !!extended.twoFactor;
            } catch(e) {}
            this.updateProfileBadges();
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
            address: formData.get('address'),
            birthDate: formData.get('birthDate'),
            city: formData.get('city'),
            country: formData.get('country')
        };

        try {
            // In a real implementation, this would call apiService.updateProfile()
            showNotification('¡Perfil actualizado exitosamente!', 'success');
            
            // Update local user data
            const user = authManager.getCurrentUser();
            user.name = `${profileData.firstName} ${profileData.lastName}`;
            user.email = profileData.email;
            localStorage.setItem('user', JSON.stringify(user));
            const prev = JSON.parse(localStorage.getItem('profileExtended')||'{}');
            const merged = { ...prev, phone:profileData.phone, address:profileData.address, birthDate:profileData.birthDate, city:profileData.city, country:profileData.country };
            localStorage.setItem('profileExtended', JSON.stringify(merged));
            this.updateProfileBadges();
            
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
        if (confirm('¿Seguro que deseas anular esta reserva?')) {
            try {
                await apiService.cancelReservation(reservationId);
                showNotification('Reserva anulada correctamente', 'success');
                await this.loadMyReservations();
            } catch (error) {
                console.error('Error al anular la reserva:', error);
                showNotification('Error al anular la reserva', 'error');
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
            anulada: 'anulada',
            cancelled: 'anulada',
            canceled: 'anulada', // por compatibilidad
            completed: 'completado',
            failed: 'fallido',
            refunded: 'reembolsado'
        };
        return map[status] || this.capitalizeFirst(status);
    }

    normalizeStatus(raw) {
        if (!raw) return 'pending';
        const s = raw.toLowerCase();
        if (s.startsWith('conf')) return 'confirmed';
        if (s.startsWith('pend')) return 'pending';
        if (s.startsWith('anul')) return 'anulada';
        if (s.startsWith('canc')) return 'anulada'; // soportar históricos cancelada/cancelled
        if (s.startsWith('compl')) return 'completed';
        return s;
    }

    setupReservationFilters() {
        const container = document.getElementById('clientReservationFilters');
        if (!container) return;
        container.addEventListener('click', (e)=>{
            const btn = e.target.closest('.qf-btn');
            if (!btn) return;
            const filter = btn.getAttribute('data-filter');
            if (!filter) return;
            this.reservationsFilter = filter;
            container.querySelectorAll('.qf-btn').forEach(b=>b.classList.remove('active'));
            btn.classList.add('active');
            this.renderMyReservations();
        });
    }

    simulatePay(reservationId) {
        showNotification('Pago procesado (simulado)', 'success');
        // Simplemente vuelve a renderizar para mostrar como completado
        const res = this.data.reservations.find(r=>r.id===reservationId);
        if (res) res.status = res.status; // no cambiamos reserva, solo refrescamos UI
        this.renderMyReservations();
    }

    updateProfileBadges() {
        try {
            const extended = JSON.parse(localStorage.getItem('profileExtended')||'{}');
            const fields = ['phone','address','birthDate','city','country'];
            const filled = fields.filter(f => extended[f] && extended[f].toString().trim() !== '').length;
            const badge = document.getElementById('personalStatusBadge');
            if (badge) {
                if (filled === fields.length) { badge.textContent='Completo'; badge.classList.remove('warning'); }
                else if (filled >= 3) { badge.textContent='Parcial'; badge.classList.remove('warning'); }
                else { badge.textContent='Incompleto'; badge.classList.add('warning'); }
            }
            const notifBadge = document.getElementById('notifBadge');
            if (notifBadge) notifBadge.textContent = extended.notifEmail ? 'Activo' : 'Inactivo';
            const securityBadge = document.getElementById('securityBadge');
            if (securityBadge) {
                if (extended.twoFactor) { securityBadge.textContent='Protegido'; securityBadge.classList.remove('warning'); }
                else { securityBadge.textContent='Revisar'; securityBadge.classList.add('warning'); }
            }
        } catch(e) {}
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
    document.addEventListener('change', (e)=>{
        const t = e.target;
        if (t && t.id === 'notifEmailToggle') {
            const extended = JSON.parse(localStorage.getItem('profileExtended')||'{}');
            extended.notifEmail = t.checked; localStorage.setItem('profileExtended', JSON.stringify(extended));
            clientDashboard.updateProfileBadges();
            showNotification('Preferencia de email actualizada', 'success');
        }
        if (t && t.id === 'twoFactorToggle') {
            const extended = JSON.parse(localStorage.getItem('profileExtended')||'{}');
            extended.twoFactor = t.checked; localStorage.setItem('profileExtended', JSON.stringify(extended));
            clientDashboard.updateProfileBadges();
            showNotification('Estado 2FA actualizado', 'success');
        }
    });
}

// Make functions globally available for onclick handlers
window.clientDashboard = clientDashboard;