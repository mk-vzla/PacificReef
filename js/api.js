// API Service - Pure Mock Data Service (No Network Calls)
class ApiService {
    constructor() {
        this.useMockData = true;
        console.log('🎯 API Service initialized with PURE MOCK DATA - No network calls');
        
        // Initialize mock data
        this.initializeMockData();
    }

    initializeMockData() {
        // Mock user data
        this.mockUsers = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                name: 'Administrador Hotel',
                email: 'admin@pacificreef.com',
                role: 'admin',
                avatar: 'A'
            },
            {
                id: 2,
                username: 'client',
                password: 'client123',
                name: 'Cliente Demo',
                email: 'cliente@ejemplo.com',
                role: 'client',
                avatar: 'C'
            },
            // Clientes ficticios adicionales
            {
                id: 3,
                username: 'maria',
                password: 'maria123',
                name: 'María López',
                email: 'maria.lopez@example.com',
                role: 'client',
                avatar: 'M'
            },
            {
                id: 4,
                username: 'juan',
                password: 'juan123',
                name: 'Juan Pérez',
                email: 'juan.perez@example.com',
                role: 'client',
                avatar: 'J'
            },
            {
                id: 5,
                username: 'sofia',
                password: 'sofia123',
                name: 'Sofía Herrera',
                email: 'sofia.herrera@example.com',
                role: 'client',
                avatar: 'S'
            },
            {
                id: 6,
                username: 'carlos',
                password: 'carlos123',
                name: 'Carlos Medina',
                email: 'carlos.medina@example.com',
                role: 'client',
                avatar: 'C'
            },
            {
                id: 7,
                username: 'ana',
                password: 'ana123',
                name: 'Ana Torres',
                email: 'ana.torres@example.com',
                role: 'client',
                avatar: 'A'
            },
            // Usuarios adicionales solicitados
            { id: 8, username: 'luis', password: 'luis123', name: 'Luis Cabrera', email: 'luis.cabrera@example.com', role: 'client', avatar:'L' },
            { id: 9, username: 'valeria', password: 'valeria123', name: 'Valeria Soto', email: 'valeria.soto@example.com', role: 'client', avatar:'V' },
            { id: 10, username: 'diego', password: 'diego123', name: 'Diego Rivas', email: 'diego.rivas@example.com', role: 'client', avatar:'D' },
            { id: 11, username: 'andres', password: 'andres123', name: 'Andrés Molina', email: 'andres.molina@example.com', role: 'client', avatar:'A' },
            { id: 12, username: 'patricia', password: 'patricia123', name: 'Patricia León', email: 'patricia.leon@example.com', role: 'client', avatar:'P' },
            { id: 13, username: 'ricardo', password: 'ricardo123', name: 'Ricardo Fuentes', email: 'ricardo.fuentes@example.com', role: 'client', avatar:'R' },
            { id: 14, username: 'fernanda', password: 'fernanda123', name: 'Fernanda Díaz', email: 'fernanda.diaz@example.com', role: 'client', avatar:'F' },
            { id: 15, username: 'jorge', password: 'jorge123', name: 'Jorge Salinas', email: 'jorge.salinas@example.com', role: 'client', avatar:'J' },
            { id: 16, username: 'valentin', password: 'valentin123', name: 'Valentín Herrera', email: 'valentin.herrera@example.com', role: 'client', avatar:'V' },
            { id: 17, username: 'carla', password: 'carla123', name: 'Carla Peña', email: 'carla.pena@example.com', role: 'client', avatar:'C' }
        ];

        // Mock room data
        // Extended room mock to support advanced management UI
        // status mapping legacy -> extended: Disponible->available, Ocupada->occupied, Mantenimiento->maintenance
        this.mockRooms = [
            {
                id: 1,
                number: '501',
                name: 'Suite Oceanview Premium',
                type: 'suite',
                floor: 5,
                capacity: 4,
                basePrice: 450,
                currentPrice: 450,
                status: 'available',
                amenities: ['Vista al mar','Balcón privado','Jacuzzi','WiFi','Minibar'],
                lastCleaned: '2025-09-19',
                nextMaintenance: '2025-10-15',
                reservations: 3
            },
            {
                id: 2,
                number: '502',
                name: 'Suite Oceanview Premium',
                type: 'suite',
                floor: 5,
                capacity: 4,
                basePrice: 450,
                currentPrice: 450,
                status: 'occupied',
                amenities: ['Vista al mar','Balcón privado','Jacuzzi','WiFi','Minibar'],
                lastCleaned: '2025-09-17',
                nextMaintenance: '2025-10-15',
                occupiedUntil: '2025-09-27',
                reservations: 5
            },
            {
                id: 3,
                number: '205',
                name: 'Hab. Deluxe',
                type: 'deluxe',
                floor: 2,
                capacity: 2,
                basePrice: 280,
                currentPrice: 315,
                status: 'maintenance',
                amenities: ['Vista parcial al mar','Balcón','WiFi','Aire acondicionado'],
                lastCleaned: '2025-09-18',
                nextMaintenance: '2025-09-22',
                reservations: 2
            },
            {
                id: 4,
                number: '102',
                name: 'Hab. Standard',
                type: 'standard',
                floor: 1,
                capacity: 2,
                basePrice: 180,
                currentPrice: 200,
                status: 'cleaning',
                amenities: ['WiFi','Aire acondicionado','TV por cable'],
                lastCleaned: '2025-09-20',
                nextMaintenance: '2025-11-01',
                reservations: 1
            },
            {
                id: 5,
                number: '302',
                name: 'Villa Familiar',
                type: 'villa',
                floor: 3,
                capacity: 6,
                basePrice: 650,
                currentPrice: 650,
                status: 'out_of_service',
                amenities: ['Vista al mar','Piscina privada','Cocina completa','WiFi','Jardín'],
                lastCleaned: '2025-09-15',
                nextMaintenance: '2025-09-25',
                reservations: 0
            }
        ];

        // Mock reservation data
        this.mockReservations = [
            // Confirmada
            {
                id: 1,
                userId: 2,
                roomId: 2,
                userName: 'Cliente Demo',
                roomNumber: '102',
                checkIn: '2025-09-20',
                checkOut: '2025-09-22',
                status: 'Confirmada', // Check-in hoy (1)
                totalAmount: 240,
                guests: 2
            },
            // Pendiente
            {
                id: 2,
                userId: 3,
                roomId: 3,
                userName: 'María López',
                roomNumber: '201',
                checkIn: '2025-09-20',
                checkOut: '2025-09-21',
                status: 'Pendiente',
                totalAmount: 480,
                guests: 2
            },
            // Anulada
            {
                id: 3,
                userId: 4,
                roomId: 1,
                userName: 'Juan Pérez',
                roomNumber: '101',
                checkIn: '2025-09-15',
                checkOut: '2025-09-16',
                status: 'Anulada',
                totalAmount: 160,
                guests: 1
            },
            // Pasadas completadas (2)
            {
                id: 4,
                userId: 8,
                roomId: 5,
                userName: 'Luis Cabrera',
                roomNumber: '301',
                checkIn: '2025-09-12',
                checkOut: '2025-09-14',
                status: 'Completada',
                totalAmount: 400,
                guests: 2
            },
            {
                id: 5,
                userId: 9,
                roomId: 4,
                userName: 'Valeria Soto',
                roomNumber: '202',
                checkIn: '2025-09-13',
                checkOut: '2025-09-15',
                status: 'Completada',
                totalAmount: 360,
                guests: 2
            },
            // Futuras / semana
            {
                id: 6,
                userId: 10,
                roomId: 3,
                userName: 'Diego Rivas',
                roomNumber: '201',
                checkIn: '2025-09-21',
                checkOut: '2025-09-23',
                status: 'Confirmada',
                totalAmount: 480,
                guests: 2
            },
            {
                id: 7,
                userId: 11,
                roomId: 5,
                userName: 'Andrés Molina',
                roomNumber: '301',
                checkIn: '2025-09-22',
                checkOut: '2025-09-24',
                status: 'Confirmada',
                totalAmount: 400,
                guests: 3
            },
            {
                id: 8,
                userId: 12,
                roomId: 2,
                userName: 'Patricia León',
                roomNumber: '102',
                checkIn: '2025-09-23',
                checkOut: '2025-09-25',
                status: 'Pendiente',
                totalAmount: 240,
                guests: 1
            },
            {
                id: 9,
                userId: 13,
                roomId: 1,
                userName: 'Ricardo Fuentes',
                roomNumber: '101',
                checkIn: '2025-09-24',
                checkOut: '2025-09-27',
                status: 'Confirmada',
                totalAmount: 320,
                guests: 2
            },
            {
                id: 10,
                userId: 14,
                roomId: 4,
                userName: 'Fernanda Díaz',
                roomNumber: '202',
                checkIn: '2025-09-25',
                checkOut: '2025-09-28',
                status: 'Confirmada',
                totalAmount: 360,
                guests: 2
            }
            ,
            // ---- Reservas adicionales Cliente Demo ----
            {
                id: 11,
                userId: 2,
                roomId: 1,
                userName: 'Cliente Demo',
                roomNumber: '101',
                checkIn: '2025-09-05',
                checkOut: '2025-09-07',
                status: 'Completada',
                totalAmount: 320,
                guests: 2
            },
            {
                id: 12,
                userId: 2,
                roomId: 3,
                userName: 'Cliente Demo',
                roomNumber: '201',
                checkIn: '2025-09-10',
                checkOut: '2025-09-12',
                status: 'Completada',
                totalAmount: 480,
                guests: 2
            },
            {
                id: 13,
                userId: 2,
                roomId: 4,
                userName: 'Cliente Demo',
                roomNumber: '202',
                checkIn: '2025-09-18',
                checkOut: '2025-09-19',
                status: 'Anulada',
                totalAmount: 360,
                guests: 1
            },
            {
                id: 14,
                userId: 2,
                roomId: 5,
                userName: 'Cliente Demo',
                roomNumber: '301',
                checkIn: '2025-09-23',
                checkOut: '2025-09-25',
                status: 'Pendiente',
                totalAmount: 400,
                guests: 3
            },
            {
                id: 15,
                userId: 2,
                roomId: 2,
                userName: 'Cliente Demo',
                roomNumber: '102',
                checkIn: '2025-09-26',
                checkOut: '2025-09-28',
                status: 'Confirmada',
                totalAmount: 240,
                guests: 2
            }
            ,
            // Nueva reserva pendiente SIN pago completado (simulación de pago pendiente)
            {
                id: 16,
                userId: 2,
                roomId: 1,
                userName: 'Cliente Demo',
                roomNumber: '101',
                checkIn: '2025-09-29',
                checkOut: '2025-10-01',
                status: 'Pendiente',
                totalAmount: 320,
                guests: 2
            }
        ];

        console.log('✅ Mock data initialized:', {
            users: this.mockUsers.length,
            rooms: this.mockRooms.length,
            reservations: this.mockReservations.length
        });
    }

    // Authentication methods
    async login(credentials) {
        console.log('🔐 Mock login attempt:', credentials);
        
        // Simulate API delay
        await this.delay(500);
        
        const user = this.mockUsers.find(u => 
            u.username === credentials.username && u.password === credentials.password
        );
        
        if (user) {
            console.log('✅ Login successful:', user.name);
            return {
                success: true,
                token: 'mock-jwt-token-' + Date.now(),
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar
                }
            };
        } else {
            console.log('❌ Login failed: Invalid credentials');
            return {
                success: false,
                message: 'Credenciales inválidas'
            };
        }
    }

    async logout() {
        console.log('🚪 Mock logout');
        await this.delay(200);
        return { success: true };
    }

    // User management methods
    async getUsers(filters = {}) {
        console.log('👥 Getting mock users:', filters);
        await this.delay(300);
        const list = this.mockUsers.map(user => ({
            ...user,
            status: 'active',
            password: undefined
        }));
        return { data: list };
    }

    async createUser(userData) {
        console.log('➕ Creating mock user:', userData);
        await this.delay(400);
        
        const newUser = {
            id: this.mockUsers.length + 1,
            ...userData,
            avatar: userData.name.charAt(0).toUpperCase()
        };
        
        this.mockUsers.push(newUser);
        return { success: true, data: newUser };
    }

    async updateUser(userId, userData) {
        console.log('✏️ Updating mock user:', userId, userData);
        await this.delay(400);
        
        const userIndex = this.mockUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.mockUsers[userIndex] = { ...this.mockUsers[userIndex], ...userData };
            return { success: true, data: this.mockUsers[userIndex] };
        }
        return { success: false, message: 'Usuario no encontrado' };
    }

    async deleteUser(userId) {
        console.log('🗑️ Deleting mock user:', userId);
        await this.delay(300);
        
        const userIndex = this.mockUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.mockUsers.splice(userIndex, 1);
            return { success: true };
        }
        return { success: false, message: 'Usuario no encontrado' };
    }

    // Room management methods
    async getRooms(filters = {}) {
        console.log('🏠 Getting mock rooms:', filters);
        await this.delay(300);
        
        let rooms = [...this.mockRooms];
        
        // Apply filters
        if (filters.status) {
            rooms = rooms.filter(room => room.status === filters.status);
        }
        if (filters.type) {
            rooms = rooms.filter(room => room.type === filters.type);
        }
        
        return { data: rooms };
    }

    async createRoom(roomData) {
        console.log('➕ Creating mock room:', roomData);
        await this.delay(400);
        
        const newRoom = {
            id: this.mockRooms.length + 1,
            ...roomData,
            status: 'Disponible'
        };
        
        this.mockRooms.push(newRoom);
        return { success: true, data: newRoom };
    }

    async updateRoom(roomId, roomData) {
        console.log('✏️ Updating mock room:', roomId, roomData);
        await this.delay(400);
        
        const roomIndex = this.mockRooms.findIndex(r => r.id === roomId);
        if (roomIndex !== -1) {
            this.mockRooms[roomIndex] = { ...this.mockRooms[roomIndex], ...roomData };
            return { success: true, data: this.mockRooms[roomIndex] };
        }
        return { success: false, message: 'Habitación no encontrada' };
    }

    async deleteRoom(roomId) {
        console.log('🗑️ Deleting mock room:', roomId);
        await this.delay(300);
        
        const roomIndex = this.mockRooms.findIndex(r => r.id === roomId);
        if (roomIndex !== -1) {
            this.mockRooms.splice(roomIndex, 1);
            return { success: true };
        }
        return { success: false, message: 'Habitación no encontrada' };
    }

    async getAvailableRooms(filters = {}) {
        console.log('🔍 Getting available mock rooms:', filters);
        await this.delay(300);
        const available = this.mockRooms.filter(room => room.status === 'Disponible');
        return { data: available };
    }

    // Reservation management methods
    async getReservations(filters = {}) {
        console.log('📅 Getting mock reservations:', filters);
        await this.delay(300);
        
        let reservations = [...this.mockReservations];
        
        if (filters.userId) {
            reservations = reservations.filter(r => r.userId === filters.userId);
        }
        
        return { data: reservations };
    }

    async createReservation(reservationData) {
        console.log('➕ Creating mock reservation:', reservationData);
        await this.delay(500);
        
        const newReservation = {
            id: this.mockReservations.length + 1,
            ...reservationData,
            status: 'Confirmada'
        };
        
        this.mockReservations.push(newReservation);
        
        // Update room status
        const roomIndex = this.mockRooms.findIndex(r => r.id === reservationData.roomId);
        if (roomIndex !== -1) {
            this.mockRooms[roomIndex].status = 'Ocupada';
        }
        
        return { success: true, data: newReservation };
    }

    async updateReservation(reservationId, reservationData) {
        console.log('✏️ Updating mock reservation:', reservationId, reservationData);
        await this.delay(400);
        
        const reservationIndex = this.mockReservations.findIndex(r => r.id === reservationId);
        if (reservationIndex !== -1) {
            this.mockReservations[reservationIndex] = { ...this.mockReservations[reservationIndex], ...reservationData };
            return { success: true, data: this.mockReservations[reservationIndex] };
        }
        return { success: false, message: 'Reserva no encontrada' };
    }

    async cancelReservation(reservationId) {
        console.log('❌ Canceling mock reservation:', reservationId);
        await this.delay(400);
        
        const reservationIndex = this.mockReservations.findIndex(r => r.id === reservationId);
        if (reservationIndex !== -1) {
            const reservation = this.mockReservations[reservationIndex];
            reservation.status = 'Anulada';
            
            // Update room status back to available
            const roomIndex = this.mockRooms.findIndex(r => r.id === reservation.roomId);
            if (roomIndex !== -1) {
                this.mockRooms[roomIndex].status = 'Disponible';
            }
            
            return { success: true };
        }
        return { success: false, message: 'Reserva no encontrada' };
    }

    async getMyReservations(userId) {
        console.log('👤 Getting user reservations (userId optional):', userId);
        await this.delay(300);
        const reservations = this.mockReservations.filter(r => !userId || r.userId === userId);
        return { data: reservations };
    }

    // Additional helper methods required by dashboards
    async searchRooms(params = {}) {
        console.log('🔎 Searching rooms with params:', params);
        await this.delay(400);
        // Simple filter based on availability and optional type/price
        let rooms = this.mockRooms.filter(r => r.status === 'Disponible');
        if (params.roomType) {
            rooms = rooms.filter(r => r.type.toLowerCase() === params.roomType.toLowerCase());
        }
        if (params.maxPrice) {
            rooms = rooms.filter(r => r.price <= parseFloat(params.maxPrice));
        }
        return { data: rooms };
    }

    async getPaymentHistory(filters = {}) {
        console.log('💳 Getting payment history:', filters);
        await this.delay(300);
        const payments = [
            {
                id: 1,
                reservationId: 1,
                amount: 240,
                method: 'Tarjeta de Crédito',
                status: 'completed',
                date: '2025-01-10'
            },
            {
                id: 2,
                reservationId: 2,
                amount: 600,
                method: 'Transferencia',
                status: 'pending',
                date: '2025-01-15'
            }
        ];
        return { data: payments };
    }

    // Analytics methods
    async getDashboardStats() {
        console.log('📊 Getting mock dashboard stats');
        await this.delay(400);
        
        const totalRooms = this.mockRooms.length;
        const occupiedRooms = this.mockRooms.filter(r => r.status === 'Ocupada').length;
        const availableRooms = this.mockRooms.filter(r => r.status === 'Disponible').length;
        const maintenanceRooms = this.mockRooms.filter(r => r.status === 'Mantenimiento').length;
        
        return {
            totalRooms,
            occupiedRooms,
            availableRooms,
            maintenanceRooms,
            occupancyRate: Math.round((occupiedRooms / totalRooms) * 100),
            totalReservations: this.mockReservations.length,
            pendingReservations: this.mockReservations.filter(r => r.status === 'Pendiente').length,
            totalRevenue: this.mockReservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0),
            monthlyRevenue: 12450
        };
    }

    async getOccupancyReport(dateRange) {
        console.log('📈 Getting mock occupancy report:', dateRange);
        await this.delay(500);
        
        // Generate mock occupancy data
        const days = 30;
        const data = [];
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (days - i));
            data.push({
                date: date.toISOString().split('T')[0],
                occupancy: Math.floor(Math.random() * 40) + 60, // 60-100%
                revenue: Math.floor(Math.random() * 2000) + 1000
            });
        }
        
        return data;
    }

    async getRevenueReport(dateRange) {
        console.log('💰 Getting mock revenue report:', dateRange);
        await this.delay(500);
        
        // Generate mock revenue data
        return {
            totalRevenue: 45600,
            monthlyRevenue: 12450,
            averageDailyRate: 135,
            revenueByRoomType: [
                { type: 'Standard', revenue: 15200 },
                { type: 'Deluxe', revenue: 18400 },
                { type: 'Suite', revenue: 12000 }
            ]
        };
    }

    // Payment methods
    async getPayments(filters = {}) {
        console.log('💳 Getting mock payments:', filters);
        await this.delay(300);
        
        return [
            {
                id: 1,
                reservationId: 1,
                amount: 240,
                method: 'Tarjeta de Crédito',
                status: 'Completado',
                date: '2024-03-15'
            },
            {
                id: 2,
                reservationId: 2,
                amount: 600,
                method: 'Transferencia',
                status: 'Pendiente',
                date: '2024-03-20'
            }
        ];
    }

    async processPayment(paymentData) {
        console.log('💳 Processing mock payment:', paymentData);
        await this.delay(800);
        
        // Simulate payment processing
        const success = Math.random() > 0.1; // 90% success rate
        
        return {
            success,
            transactionId: 'TXN-' + Date.now(),
            message: success ? 'Pago procesado exitosamente' : 'Error en el procesamiento del pago'
        };
    }

    // Utility methods
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // API health check
    async healthCheck() {
        console.log('🏥 Mock API health check');
        await this.delay(100);
        return {
            status: 'healthy',
            service: 'Pacific Reef Hotel API (Mock)',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        };
    }
}

// Create global API service instance
const apiService = new ApiService();

console.log('🚀 Pacific Reef Hotel API Service ready (Pure Mock Mode)');