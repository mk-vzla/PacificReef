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
    this.currentSection = 'reservations';
        this.data = {
            rooms: [],
            reservations: [],
            users: [],
            stats: {},
            reports: []
        };
        this.filters = {
            rooms: {},
            reservations: {},
            users: {},
            reports: { category:'all' }
        };
        this.reservationsUI = {
            searchTerm: '',
            status: 'all',
            payment: 'all'
        };
    }

    async init() {
        if (!authManager.requireRole('admin')) {
            return;
        }

        this.setupNavigation();
        this.setupModals();
        this.setupFilters();
    // Dashboard removido: cargamos directamente reservas como vista inicial
    await this.loadSectionData('reservations');
    this.showSection('reservations');
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
            'rooms': 'Gestión de Habitaciones',
            'reservations': 'Gestión de Reservas',
            'users': 'Gestión de Usuarios',
            'reports': 'Reportes y Analítica'
        };
        return titles[sectionName] || 'Gestión';
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


    async loadRooms() {
        try {
            const response = await apiService.getRooms(this.filters.rooms);
            this.data.rooms = response.data || [];
            this.renderRoomsCards();
        } catch (error) {
            console.error('Error loading rooms:', error);
            this.renderRoomsCards(true);
        }
    }

    /* ================= REPORTES ================= */
    async loadReports(){
        if(!this.data.reports.length){
            this.data.reports = [
                { id:'1', title:'Reporte de Ingresos Mensual', desc:'Análisis detallado de ingresos por habitación, servicios adicionales y tendencias de facturación', category:'ingresos', icon:'fa-dollar-sign', last:'2024-01-15', format:'PDF' },
                { id:'2', title:'Reporte de Ingresos por Temporada', desc:'Comparativa de ingresos entre temporadas alta, media y baja con proyecciones', category:'ingresos', icon:'fa-chart-line', last:'2024-01-10', format:'PDF' },
                { id:'3', title:'Análisis de Ocupación Hotelera', desc:'Estadísticas de ocupación por tipo de habitación, días de la semana y patrones estacionales', category:'ocupacion', icon:'fa-bed', last:'2024-01-12', format:'Excel' },
                { id:'4', title:'Reporte de Disponibilidad de Habitaciones', desc:'Estado actual y proyectado de disponibilidad, mantenimientos programados', category:'ocupacion', icon:'fa-calendar-days', last:'2024-01-14', format:'PDF' },
                { id:'5', title:'Perfil y Satisfacción de Clientes', desc:'Análisis demográfico de huéspedes, preferencias y ratings de satisfacción', category:'clientes', icon:'fa-users', last:'2024-01-13', format:'PDF' },
                { id:'6', title:'Reporte de Lealtad de Clientes', desc:'Estadísticas de clientes recurrentes, programa VIP y retención de huéspedes', category:'clientes', icon:'fa-heart', last:'2024-01-11', format:'Excel' }
            ];
        }
        this.renderReports();
        this.setupReportFilters();
    }

    setupReportFilters(){
        const select = document.getElementById('reportCategoryFilter');
        const showAll = document.getElementById('showAllReportsBtn');
        if(select){
            select.onchange = ()=>{ this.filters.reports.category = select.value; this.renderReports(); };
        }
        if(showAll){
            showAll.onclick = ()=>{ this.filters.reports.category='all'; if(select) select.value='all'; this.renderReports(); };
        }
    }

    getReportCategoryName(cat){
        return cat==='ingresos'?'Ingresos':cat==='ocupacion'?'Ocupación':cat==='clientes'?'Clientes':'General';
    }

    renderReports(){
        const statsContainer = document.getElementById('reportsStats');
        const grid = document.getElementById('reportsGrid');
        const empty = document.getElementById('reportsEmpty');
        if(!statsContainer || !grid) return;

        const total = this.data.reports.length;
        const cats = new Set(this.data.reports.map(r=>r.category));
        statsContainer.innerHTML = `
          <div class="report-stat"><div class="icon"><i class="fas fa-file-alt"></i></div><div class="info"><h4>${total}</h4><p>Reportes Disponibles</p></div></div>
          <div class="report-stat"><div class="icon"><i class="fas fa-clock"></i></div><div class="info"><h4>Hace 1 día</h4><p>Último Generado</p></div></div>
          <div class="report-stat"><div class="icon"><i class="fas fa-layer-group"></i></div><div class="info"><h4>${cats.size}</h4><p>Categorías</p></div></div>`;

        const category = this.filters.reports.category;
        const list = category==='all' ? this.data.reports : this.data.reports.filter(r=>r.category===category);
        if(!list.length){
            grid.innerHTML='';
            if(empty) empty.style.display='flex';
            return;
        } else if(empty) empty.style.display='none';

        grid.innerHTML = list.map(r=>`<div class="report-card">
            <div class="rc-top">
              <div class="rc-icon"><i class="fas ${r.icon}"></i></div>
              <span class="report-badge ${r.category}">${this.getReportCategoryName(r.category)}</span>
            </div>
            <h4>${r.title}</h4>
            <p class="desc">${r.desc}</p>
            <div class="report-meta"><span><i class="fas fa-clock"></i> Último: ${r.last}</span><span><i class="fas fa-file"></i> ${r.format}</span></div>
            <div style="display:flex; justify-content:flex-end;">
              <button class="report-generate" onclick="adminDashboard.generateReport('${r.id}')"><i class="fas fa-download"></i> Generar</button>
            </div>
        </div>`).join('');
    }

    generateReport(reportId){
        const r = this.data.reports.find(x=>x.id===reportId);
        if(!r) return;
        alert(`Descargando reporte: ${r.title} (Formato ${r.format})...`);
    }

        renderRoomsCards(error = false) {
                const grid = document.getElementById('roomsCards');
                const empty = document.getElementById('roomsEmptyState');
                const statsEl = document.getElementById('roomsStats');
                if(!grid) return;
                if(error){ grid.innerHTML=''; if(empty) empty.style.display='flex'; return; }
                const rooms = this.data.rooms || [];
                if(!rooms.length){ grid.innerHTML=''; if(empty) empty.style.display='flex'; return; } else if(empty) empty.style.display='none';

                // Obtener filtros actuales (se guardan en this.filters.rooms)
                const search = (this.filters.rooms.search||'').toLowerCase();
                const status = this.filters.rooms.status || 'all';
                const type = this.filters.rooms.type || 'all';
                const floor = this.filters.rooms.floor || 'all';

                const filtered = rooms.filter(r=>{
                        const matchesSearch = !search || (r.number+''+ (r.name||'')).toLowerCase().includes(search);
                        const matchesStatus = status==='all' || r.status===status;
                        const matchesType = type==='all' || r.type===type;
                        const matchesFloor = floor==='all' || String(r.floor)===String(floor);
                        return matchesSearch && matchesStatus && matchesType && matchesFloor;
                });

                // Stats
                const total = rooms.length;
                const available = rooms.filter(r=>r.status==='available').length;
                const occupied = rooms.filter(r=>r.status==='occupied').length;
                const maintenance = rooms.filter(r=>r.status==='maintenance').length;
                const occupancyRate = total? ((occupied/total)*100).toFixed(1):'0.0';
                if(statsEl){
                        statsEl.innerHTML = `
                            <div class="room-stat-card total"><div><h4>Total</h4><p>${total}</p></div><div class="icon"><i class="fas fa-bed"></i></div></div>
                            <div class="room-stat-card available"><div><h4>Disponibles</h4><p>${available}</p></div><div class="icon"><i class="fas fa-check-circle"></i></div></div>
                            <div class="room-stat-card occupied"><div><h4>Ocupadas</h4><p>${occupied}</p></div><div class="icon"><i class="fas fa-user-group"></i></div></div>
                            <div class="room-stat-card maintenance"><div><h4>Mantenimiento</h4><p>${maintenance}</p></div><div class="icon"><i class="fas fa-screwdriver-wrench"></i></div></div>
                            <div class="room-stat-card occupancy"><div><h4>Ocupación</h4><p>${occupancyRate}%</p></div><div class="icon"><i class="fas fa-dollar-sign"></i></div></div>`;
                }

                if(!filtered.length){ grid.innerHTML=''; if(empty) empty.style.display='flex'; return; } else if(empty) empty.style.display='none';

                const formatDate = (d)=>{ try { return new Date(d).toLocaleDateString('es-ES'); } catch(e){ return d||'-'; } };
                const capLabel = (n)=> `${n} huésped${n===1?'':'es'}`;
                const typeMap = { standard:'Standard', deluxe:'Deluxe', suite:'Suite', villa:'Villa' };
                const statusText = { available:'Disponible', occupied:'Ocupada', maintenance:'Mantenimiento', cleaning:'Limpieza', out_of_service:'Fuera de servicio' };

                grid.innerHTML = filtered.map(r=>{
                        const amenities = r.amenities||[];
                        const visible = amenities.slice(0,3).map(a=>`<span class="chip">${a}</span>`).join('');
                        const more = amenities.length>3 ? `<span class="chip more">+${amenities.length-3} más</span>` : '';
                        return `<div class="room-adv-card">
                            <div class="rac-head">
                                <div class="rac-ident">
                                    <h4><i class="fas fa-bed" style="color:#38bdf8"></i> #${r.number}</h4>
                                    <p>${r.name||''} • Piso ${r.floor||'?'} </p>
                                </div>
                                <span class="status-badge ${r.status}">${statusText[r.status]||r.status}</span>
                            </div>
                            <div class="rac-meta-grid">
                                <div class="blk"><p>Tipo</p><span>${typeMap[r.type]||r.type}</span></div>
                                <div class="blk"><p>Capacidad</p><span>${capLabel(r.capacity||1)}</span></div>
                                <div class="blk"><p>Precio Base</p><span>$${r.basePrice||r.currentPrice||0}</span></div>
                                <div class="blk"><p>Precio Actual</p><span>$${r.currentPrice||r.basePrice||0}</span></div>
                            </div>
                            ${r.occupiedUntil? `<div class="occupied-until">Ocupada hasta: ${formatDate(r.occupiedUntil)}</div>`:''}
                            <div class="room-info-box">
                                <div><p>Última limpieza</p><span>${formatDate(r.lastCleaned)}</span></div>
                                <div><p>Reservas pendientes</p><span>${r.reservations||0}</span></div>
                            </div>
                            <div class="amenities-block">
                                <h5>Amenidades</h5>
                                <div class="amenities-chips">${visible}${more}</div>
                            </div>
                            <div class="room-actions">
                                <button class="room-act-btn" onclick="adminDashboard.editRoom(${r.id})"><i class="fas fa-edit"></i> Editar</button>
                            </div>
                        </div>`;
                }).join('');
        }

    async loadReservations() {
        try {
            const response = await apiService.getReservations(this.filters.reservations);
            this.data.reservations = response.data || [];
            this.updateReservationStats();
            this.renderReservationsTable();
            this.setupReservationFiltersOnce();
        } catch (error) {
            console.error('Error loading reservations:', error);
            this.renderReservationsTable(true);
        }
    }
    setupReservationFiltersOnce(){
        if(this._reservationFiltersSetup) return;
        this._reservationFiltersSetup = true;
        const search = document.getElementById('reservationSearchInput');
        const statusSel = document.getElementById('reservationStatusFilter');
        const paySel = document.getElementById('reservationPaymentFilter');
        const clearBtn = document.getElementById('reservationClearFiltersBtn');
        const btnToday = document.getElementById('quickFilterToday');
    const btnUpcoming = document.getElementById('quickFilterUpcoming');
        const btnCompleted = document.getElementById('quickFilterCompleted');
        const btnCanceled = document.getElementById('quickFilterCanceled');
        if(search){
            search.addEventListener('input', this.debounce(()=>{ this.reservationsUI.searchTerm = search.value.trim().toLowerCase(); this.renderReservationsTable(); },250));
        }
        if(statusSel){ statusSel.onchange = ()=>{ this.reservationsUI.status = statusSel.value; this.renderReservationsTable(); }; }
        if(paySel){ paySel.onchange = ()=>{ this.reservationsUI.payment = paySel.value; this.renderReservationsTable(); }; }
        if(clearBtn){ clearBtn.onclick = ()=>{ this.reservationsUI = { searchTerm:'', status:'all', payment:'all'}; if(search) search.value=''; if(statusSel) statusSel.value='all'; if(paySel) paySel.value='all'; this._quickFilterMode=null; document.querySelectorAll('.reservations-quick-filters .qf-btn.active').forEach(b=>b.classList.remove('active')); this.renderReservationsTable(); }; }
        // Quick filter helpers
        const todayStr = new Date().toISOString().split('T')[0];
        const tomorrowStr = new Date(Date.now()+86400000).toISOString().split('T')[0];
        const clearActiveQuick = ()=>{
            document.querySelectorAll('.reservations-quick-filters .qf-btn.active').forEach(b=>b.classList.remove('active'));
        };
        const applyQuick = (mode)=>{
            this._quickFilterMode = mode; // track current quick filter
            clearActiveQuick();
            let btn=null;
            switch(mode){
                case 'today': btn=btnToday; break;
                case 'upcoming': btn=btnUpcoming; break;
                case 'completed': btn=btnCompleted; break;
                case 'canceled': btn=btnCanceled; break;
            }
            if(btn) btn.classList.add('active');
            this.renderReservationsTable();
        };
        if(btnToday){ btnToday.onclick = ()=> applyQuick('today'); }
    if(btnUpcoming){ btnUpcoming.onclick = ()=> applyQuick('upcoming'); }
        if(btnCompleted){ btnCompleted.onclick = ()=> applyQuick('completed'); }
        if(btnCanceled){ btnCanceled.onclick = ()=> applyQuick('canceled'); }
    }

    updateReservationStats(){
        const today = new Date().toISOString().split('T')[0];
        let checkins=0, checkouts=0, active=0, pendingPayments=0;
        this.data.reservations.forEach(r=>{
            if(r.checkIn === today) checkins++;
            if(r.checkOut === today) checkouts++;
            if(r.status && r.status.toLowerCase() !== 'anulada') active++;
            // Simulación de pagos: asumimos Pendiente si status Pendiente
            if(r.status && r.status.toLowerCase()==='pendiente') pendingPayments++;
        });
        const set = (id,val)=>{ const el=document.getElementById(id); if(el) el.textContent=val; };
        set('resStatCheckins', checkins);
        set('resStatCheckouts', checkouts);
        set('resStatActive', active);
        set('resStatPendingPayments', pendingPayments);
    }

    derivePaymentStatus(res){
        if(res.status && res.status.toLowerCase()==='pendiente') return 'Pendiente';
        if(res.status && res.status.toLowerCase()==='anulada') return 'N/A';
        return 'Pagado';
    }

    renderReservationsTable(error=false){
        const tbody = document.getElementById('reservationsTableBody');
        const empty = document.getElementById('reservationsEmptyState');
        if(!tbody) return;
        if(error){ tbody.innerHTML=''; if(empty){ empty.style.display='flex'; } return; }
        if(!this.data.reservations.length){ tbody.innerHTML=''; if(empty) empty.style.display='flex'; return; }

        const search = this.reservationsUI.searchTerm;
        const stFilter = this.reservationsUI.status;
        const payFilter = this.reservationsUI.payment;

        // Orden base por fecha ascendente (checkIn)
        const chronSorted = [...this.data.reservations].sort((a,b)=> new Date(a.checkIn) - new Date(b.checkIn));
    // Generar map de código cronológico (ignorando completadas/anuladas orden, solo fecha)
        const chronologicalCodes = new Map();
        chronSorted.forEach((r,idx)=>{ chronologicalCodes.set(r.id, 'PR-2025-'+String(idx+1).padStart(3,'0')); });

        let filtered = chronSorted.filter(r=>{
            const code = (chronologicalCodes.get(r.id)||'').toLowerCase();
            const guest = (r.userName||'').toLowerCase();
            const room = (r.roomNumber||'').toLowerCase();
            const payment = this.derivePaymentStatus(r);
            const matchesSearch = !search || code.includes(search) || guest.includes(search) || room.includes(search);
            const matchesStatus = stFilter==='all' || r.status===stFilter;
            const matchesPayment = payFilter==='all' || payment===payFilter;
            return matchesSearch && matchesStatus && matchesPayment;
        });

        // Aplicar quick filter si existe
        if(this._quickFilterMode){
            const todayStr = new Date().toISOString().split('T')[0];
            const tomorrowStr = new Date(Date.now()+86400000).toISOString().split('T')[0];
            switch(this._quickFilterMode){
                case 'today':
                    filtered = filtered.filter(r=> r.checkIn===todayStr || r.checkOut===todayStr || (r.checkIn<=todayStr && r.checkOut>=todayStr));
                    break;
                case 'upcoming':
                    // Reservas cuyo check-in es a partir de mañana (>= tomorrowStr)
                    filtered = filtered.filter(r=> r.checkIn >= tomorrowStr);
                    break;
                case 'completed':
                    filtered = filtered.filter(r=> r.status==='Completada');
                    break;
                case 'canceled':
                    filtered = filtered.filter(r=> r.status==='Anulada');
                    break;
            }
        }

    // Reorden: Activas / próximas primero, luego pasadas (Completada/Anulada)
        const today = new Date().toISOString().split('T')[0];
    const isPast = (r)=> new Date(r.checkOut) < new Date(today) || ['Completada','Anulada'].includes(r.status);
        const activeUpcoming = filtered.filter(r=> !isPast(r));
        const past = filtered.filter(r=> isPast(r));
        const finalList = [...activeUpcoming, ...past];

        if(!finalList.length){ tbody.innerHTML=''; if(empty) empty.style.display='flex'; return; } else if(empty) empty.style.display='none';

        tbody.innerHTML = finalList.map(r=>{
            const payment = this.derivePaymentStatus(r);
            const paymentClass = payment.toLowerCase()==='pagado'?'pagado': payment.toLowerCase()==='pendiente'?'pendiente':'na';
            const statusClass = (r.status||'').toLowerCase();
            const code = chronologicalCodes.get(r.id) || `PR-2025-${String(r.id).padStart(3,'0')}`;
            return `<tr>
                <td><span class="code">${code}</span></td>
                <td>${r.userName||'N/D'}</td>
                <td>${r.roomNumber||'?'}</td>
                <td>${this.formatDate(r.checkIn)}</td>
                <td>${this.formatDate(r.checkOut)}</td>
                <td>${r.guests||1}</td>
                <td class="amount">$${r.totalAmount||0}</td>
                <td><span class="tag-status ${statusClass}">${r.status}</span></td>
                <td><span class="tag-payment ${paymentClass}">${payment}</span></td>
                <td><div class="reservations-actions">
                    <button class="icon-btn edit" title="Editar" onclick="adminDashboard.editReservation(${r.id})"><i class="fas fa-edit"></i></button>
                    <button class="icon-btn cancel" title="Cancelar" onclick="adminDashboard.cancelReservation(${r.id})"><i class="fas fa-ban"></i></button>
                </div></td>
            </tr>`;
        }).join('');
    }

    cancelReservation(id){
        const r = this.data.reservations.find(x=>x.id===id); if(!r) return;
        if(!confirm('¿Cancelar esta reserva?')) return;
        // Simulación: marcar anulada
        r.status = 'Anulada';
        showNotification('Reserva anulada', 'success');
        this.updateReservationStats();
        this.renderReservationsTable();
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
        const roomFloorFilter = document.getElementById('roomFloorFilter');
        const roomClear = document.getElementById('roomClearFiltersBtn');

        if (roomSearch) {
            roomSearch.addEventListener('input', this.debounce(() => {
                this.filters.rooms.search = roomSearch.value.trim();
                this.renderRoomsCards();
            }, 250));
        }

        if (roomTypeFilter) {
            roomTypeFilter.addEventListener('change', () => {
                this.filters.rooms.type = roomTypeFilter.value;
                this.renderRoomsCards();
            });
        }

        if (roomStatusFilter) {
            roomStatusFilter.addEventListener('change', () => {
                this.filters.rooms.status = roomStatusFilter.value;
                this.renderRoomsCards();
            });
        }

        if(roomFloorFilter){
            roomFloorFilter.addEventListener('change', ()=>{
                this.filters.rooms.floor = roomFloorFilter.value;
                this.renderRoomsCards();
            });
        }

        if(roomClear){
            roomClear.addEventListener('click', ()=>{
                this.filters.rooms = { search:'', type:'all', status:'all', floor:'all' };
                if(roomSearch) roomSearch.value='';
                if(roomTypeFilter) roomTypeFilter.value='all';
                if(roomStatusFilter) roomStatusFilter.value='all';
                if(roomFloorFilter) roomFloorFilter.value='all';
                this.renderRoomsCards();
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

    async editReservation(reservationId) {
        const reservation = this.data.reservations.find(r => r.id === reservationId);
        if (reservation) {
            // Show edit reservation modal (to be implemented)
            console.log('Edit reservation:', reservation);
        }
    }

    async deleteReservation(reservationId) {
        if (confirm('¿Eliminar esta reserva?')) {
            try {
                await apiService.cancelReservation(reservationId);
                showNotification('Reserva eliminada/anulada', 'success');
                await this.loadReservations();
            } catch (e) {
                console.error('Delete reservation error', e);
                showNotification('Error al eliminar reserva', 'error');
            }
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