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
            }
        ];

        // Mock room data
        this.mockRooms = [
            {
                id: 1,
                number: '101',
                type: 'Standard',
                status: 'Disponible',
                price: 80,
                capacity: 2,
                amenities: ['WiFi', 'TV', 'Aire Acondicionado']
            },
            {
                id: 2,
                number: '102',
                type: 'Standard',
                status: 'Ocupada',
                price: 80,
                capacity: 2,
                amenities: ['WiFi', 'TV', 'Aire Acondicionado']
            },
            {
                id: 3,
                number: '201',
                type: 'Deluxe',
                status: 'Disponible',
                price: 120,
                capacity: 4,
                amenities: ['WiFi', 'TV', 'Aire Acondicionado', 'Minibar', 'Balcón']
            },
            {
                id: 4,
                number: '202',
                type: 'Deluxe',
                status: 'Mantenimiento',
                price: 120,
                capacity: 4,
                amenities: ['WiFi', 'TV', 'Aire Acondicionado', 'Minibar', 'Balcón']
            },
            {
                id: 5,
                number: '301',
                type: 'Suite',
                status: 'Disponible',
                price: 200,
                capacity: 6,
                amenities: ['WiFi', 'TV', 'Aire Acondicionado', 'Minibar', 'Balcón', 'Jacuzzi', 'Sala de estar']
            }
        ];

        // Mock reservation data
        this.mockReservations = [
            {
                id: 1,
                userId: 2,
                roomId: 2,
                userName: 'Cliente Demo',
                roomNumber: '102',
                checkIn: '2024-03-15',
                checkOut: '2024-03-18',
                status: 'Confirmada',
                totalAmount: 240,
                guests: 2
            },
            {
                id: 2,
                userId: 2,
                roomId: 3,
                userName: 'Cliente Demo',
                roomNumber: '201',
                checkIn: '2024-03-20',
                checkOut: '2024-03-25',
                status: 'Pendiente',
                totalAmount: 600,
                guests: 3
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
            reservation.status = 'Cancelada';
            
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