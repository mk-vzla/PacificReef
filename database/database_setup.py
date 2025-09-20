# Database Configuration and Schema Setup
# Pacific Reef Hotel Management System - Database Layer

import sqlite3
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseManager:
    """
    Database management class for Pacific Reef Hotel Management System.
    Handles database initialization, schema creation, and migrations.
    """
    
    def __init__(self, db_path: str = "hotel_management.db"):
        """Initialize database manager with database path."""
        self.db_path = db_path
        self.connection = None
        
    def connect(self):
        """Establish database connection."""
        try:
            self.connection = sqlite3.connect(self.db_path)
            self.connection.row_factory = sqlite3.Row  # Enable dict-like access
            logger.info(f"Connected to database: {self.db_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            return False
    
    def disconnect(self):
        """Close database connection."""
        if self.connection:
            self.connection.close()
            self.connection = None
            logger.info("Database connection closed")
    
    def create_schema(self):
        """Create database schema with all required tables."""
        if not self.connection:
            if not self.connect():
                return False
        
        try:
            cursor = self.connection.cursor()
            
            # Users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    first_name VARCHAR(50) NOT NULL,
                    last_name VARCHAR(50) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    phone VARCHAR(20),
                    password_hash VARCHAR(255) NOT NULL,
                    role VARCHAR(20) DEFAULT 'CLIENT' CHECK(role IN ('ADMIN', 'STAFF', 'CLIENT')),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN DEFAULT 1
                )
            """)
            
            # Rooms table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS rooms (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    number VARCHAR(10) UNIQUE NOT NULL,
                    type VARCHAR(20) NOT NULL CHECK(type IN ('STANDARD', 'DELUXE', 'SUITE')),
                    status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'OUT_OF_ORDER')),
                    price DECIMAL(10,2) NOT NULL,
                    capacity INTEGER DEFAULT 2,
                    description TEXT,
                    amenities TEXT, -- JSON string of amenities
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Reservations table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS reservations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    room_id INTEGER NOT NULL,
                    check_in_date DATE NOT NULL,
                    check_out_date DATE NOT NULL,
                    guests INTEGER DEFAULT 1,
                    total_amount DECIMAL(10,2) NOT NULL,
                    status VARCHAR(20) DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'COMPLETED')),
                    special_requests TEXT,
                    payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK(payment_status IN ('PENDING', 'PAID', 'PARTIAL', 'REFUNDED')),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (room_id) REFERENCES rooms(id)
                )
            """)
            
            # Payments table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS payments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    reservation_id INTEGER NOT NULL,
                    amount DECIMAL(10,2) NOT NULL,
                    payment_method VARCHAR(20) NOT NULL CHECK(payment_method IN ('CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'BANK_TRANSFER')),
                    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    transaction_id VARCHAR(100),
                    status VARCHAR(20) DEFAULT 'COMPLETED' CHECK(status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
                    notes TEXT,
                    FOREIGN KEY (reservation_id) REFERENCES reservations(id)
                )
            """)
            
            # Hotel configuration table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS hotel_config (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    config_key VARCHAR(50) UNIQUE NOT NULL,
                    config_value TEXT NOT NULL,
                    description TEXT,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Analytics events table (for tracking user interactions)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS analytics_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_type VARCHAR(50) NOT NULL,
                    user_id INTEGER,
                    reservation_id INTEGER,
                    room_id INTEGER,
                    event_data TEXT, -- JSON string
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (reservation_id) REFERENCES reservations(id),
                    FOREIGN KEY (room_id) REFERENCES rooms(id)
                )
            """)
            
            # Create indexes for better performance
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_reservations_room_id ON reservations(room_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in_date, check_out_date)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at)")
            
            self.connection.commit()
            logger.info("Database schema created successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error creating database schema: {e}")
            self.connection.rollback()
            return False
    
    def insert_sample_data(self):
        """Insert sample data for development and testing."""
        if not self.connection:
            if not self.connect():
                return False
        
        try:
            cursor = self.connection.cursor()
            
            # Sample users - Demo Credentials
            users_data = [
                ('Admin', 'User', 'admin', '+1234567890', 'admin123hash', 'ADMIN'),
                ('Client', 'User', 'client', '+1234567891', 'client123hash', 'CLIENT'),
                # Legacy users for backward compatibility
                ('John', 'Admin', 'admin@pacificreef.com', '+1234567892', 'admin123hash', 'ADMIN'),
                ('Maria', 'Garcia', 'maria.garcia@email.com', '+1234567893', 'user123hash', 'CLIENT'),
                ('James', 'Smith', 'james.smith@email.com', '+1234567894', 'user123hash', 'CLIENT'),
                ('Sarah', 'Johnson', 'sarah.johnson@email.com', '+1234567895', 'user123hash', 'CLIENT'),
                ('Michael', 'Brown', 'michael.brown@email.com', '+1234567896', 'user123hash', 'CLIENT'),
                ('Emma', 'Davis', 'emma.davis@email.com', '+1234567897', 'user123hash', 'CLIENT'),
                ('David', 'Wilson', 'david.wilson@email.com', '+1234567898', 'user123hash', 'CLIENT'),
                ('Lisa', 'Staff', 'staff@pacificreef.com', '+1234567899', 'staff123hash', 'STAFF')
            ]
            
            cursor.executemany("""
                INSERT OR IGNORE INTO users (first_name, last_name, email, phone, password_hash, role)
                VALUES (?, ?, ?, ?, ?, ?)
            """, users_data)
            
            # Sample rooms
            rooms_data = [
                ('101', 'STANDARD', 'AVAILABLE', 120.00, 2, 'Comfortable standard room with city view', '["WiFi", "TV", "AC", "Private Bathroom"]'),
                ('102', 'STANDARD', 'AVAILABLE', 120.00, 2, 'Comfortable standard room with city view', '["WiFi", "TV", "AC", "Private Bathroom"]'),
                ('103', 'STANDARD', 'OCCUPIED', 120.00, 2, 'Comfortable standard room with city view', '["WiFi", "TV", "AC", "Private Bathroom"]'),
                ('201', 'DELUXE', 'AVAILABLE', 180.00, 3, 'Spacious deluxe room with ocean view', '["WiFi", "TV", "AC", "Private Bathroom", "Balcony", "Mini Bar"]'),
                ('202', 'DELUXE', 'AVAILABLE', 180.00, 3, 'Spacious deluxe room with ocean view', '["WiFi", "TV", "AC", "Private Bathroom", "Balcony", "Mini Bar"]'),
                ('203', 'DELUXE', 'MAINTENANCE', 180.00, 3, 'Spacious deluxe room with ocean view', '["WiFi", "TV", "AC", "Private Bathroom", "Balcony", "Mini Bar"]'),
                ('301', 'SUITE', 'AVAILABLE', 350.00, 4, 'Luxury suite with panoramic ocean view', '["WiFi", "TV", "AC", "Private Bathroom", "Balcony", "Mini Bar", "Jacuzzi", "Living Area"]'),
                ('302', 'SUITE', 'AVAILABLE', 350.00, 4, 'Luxury suite with panoramic ocean view', '["WiFi", "TV", "AC", "Private Bathroom", "Balcony", "Mini Bar", "Jacuzzi", "Living Area"]'),
                ('303', 'SUITE', 'AVAILABLE', 350.00, 4, 'Luxury suite with panoramic ocean view', '["WiFi", "TV", "AC", "Private Bathroom", "Balcony", "Mini Bar", "Jacuzzi", "Living Area"]'),
                ('104', 'STANDARD', 'AVAILABLE', 120.00, 2, 'Comfortable standard room with garden view', '["WiFi", "TV", "AC", "Private Bathroom"]'),
                ('105', 'STANDARD', 'AVAILABLE', 120.00, 2, 'Comfortable standard room with garden view', '["WiFi", "TV", "AC", "Private Bathroom"]'),
                ('204', 'DELUXE', 'AVAILABLE', 180.00, 3, 'Spacious deluxe room with partial ocean view', '["WiFi", "TV", "AC", "Private Bathroom", "Balcony", "Mini Bar"]')
            ]
            
            cursor.executemany("""
                INSERT OR IGNORE INTO rooms (number, type, status, price, capacity, description, amenities)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, rooms_data)
            
            # Sample reservations
            reservations_data = [
                (2, 1, '2025-01-15', '2025-01-18', 2, 360.00, 'CONFIRMED', 'Late check-in requested', 'PAID'),
                (3, 4, '2025-01-20', '2025-01-25', 2, 900.00, 'CONFIRMED', '', 'PAID'),
                (4, 7, '2025-01-22', '2025-01-24', 4, 700.00, 'PENDING', 'Anniversary celebration', 'PENDING'),
                (5, 2, '2025-01-25', '2025-01-27', 2, 240.00, 'CONFIRMED', '', 'PARTIAL'),
                (6, 8, '2025-01-28', '2025-02-02', 3, 1050.00, 'CONFIRMED', 'Business trip', 'PAID')
            ]
            
            cursor.executemany("""
                INSERT OR IGNORE INTO reservations (user_id, room_id, check_in_date, check_out_date, guests, total_amount, status, special_requests, payment_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, reservations_data)
            
            # Sample hotel configuration
            config_data = [
                ('hotel_name', 'Pacific Reef Hotel', 'Hotel name'),
                ('hotel_address', '123 Ocean Drive, Pacific Coast', 'Hotel address'),
                ('hotel_phone', '+1-555-PACIFIC', 'Hotel phone number'),
                ('hotel_email', 'info@pacificreef.com', 'Hotel email'),
                ('check_in_time', '15:00', 'Standard check-in time'),
                ('check_out_time', '11:00', 'Standard check-out time'),
                ('currency', 'USD', 'Hotel currency'),
                ('tax_rate', '12.5', 'Tax rate percentage'),
                ('cancellation_policy', '24 hours before check-in', 'Cancellation policy'),
                ('max_advance_booking_days', '365', 'Maximum days in advance for booking')
            ]
            
            cursor.executemany("""
                INSERT OR IGNORE INTO hotel_config (config_key, config_value, description)
                VALUES (?, ?, ?)
            """, config_data)
            
            # Sample analytics events
            events_data = [
                ('user_login', 2, None, None, '{"ip": "192.168.1.100", "user_agent": "Mozilla/5.0"}'),
                ('reservation_created', 2, 1, 1, '{"amount": 360.00, "nights": 3}'),
                ('room_view', 3, None, 4, '{"duration": 45}'),
                ('user_login', 3, None, None, '{"ip": "192.168.1.101", "user_agent": "Mozilla/5.0"}'),
                ('reservation_created', 3, 2, 4, '{"amount": 900.00, "nights": 5}')
            ]
            
            cursor.executemany("""
                INSERT OR IGNORE INTO analytics_events (event_type, user_id, reservation_id, room_id, event_data)
                VALUES (?, ?, ?, ?, ?)
            """, events_data)
            
            self.connection.commit()
            logger.info("Sample data inserted successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error inserting sample data: {e}")
            self.connection.rollback()
            return False
    
    def backup_database(self, backup_path: str = None):
        """Create a backup of the database."""
        if not backup_path:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = f"backup_hotel_management_{timestamp}.db"
        
        try:
            if self.connection:
                # Use SQLite backup API
                backup_conn = sqlite3.connect(backup_path)
                self.connection.backup(backup_conn)
                backup_conn.close()
                logger.info(f"Database backup created: {backup_path}")
                return backup_path
            else:
                # File copy method if no active connection
                import shutil
                shutil.copy2(self.db_path, backup_path)
                logger.info(f"Database backup created: {backup_path}")
                return backup_path
                
        except Exception as e:
            logger.error(f"Error creating database backup: {e}")
            return None
    
    def get_database_stats(self):
        """Get database statistics."""
        if not self.connection:
            if not self.connect():
                return None
        
        try:
            cursor = self.connection.cursor()
            
            stats = {}
            
            # Table counts
            tables = ['users', 'rooms', 'reservations', 'payments', 'hotel_config', 'analytics_events']
            for table in tables:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                stats[f"{table}_count"] = cursor.fetchone()[0]
            
            # Database size
            cursor.execute("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()")
            stats['database_size_bytes'] = cursor.fetchone()[0]
            
            # Recent activity
            cursor.execute("SELECT COUNT(*) FROM reservations WHERE created_at >= date('now', '-7 days')")
            stats['reservations_last_7_days'] = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM analytics_events WHERE created_at >= date('now', '-24 hours')")
            stats['events_last_24_hours'] = cursor.fetchone()[0]
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting database stats: {e}")
            return None
    
    def __enter__(self):
        """Context manager entry."""
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.disconnect()


def initialize_database():
    """Initialize the database with schema and sample data."""
    print("Initializing Pacific Reef Hotel Management Database...")
    
    db_manager = DatabaseManager()
    
    try:
        # Connect to database
        if not db_manager.connect():
            print("❌ Failed to connect to database")
            return False
        
        # Create schema
        if not db_manager.create_schema():
            print("❌ Failed to create database schema")
            return False
        
        print("✅ Database schema created successfully")
        
        # Insert sample data
        if not db_manager.insert_sample_data():
            print("❌ Failed to insert sample data")
            return False
        
        print("✅ Sample data inserted successfully")
        
        # Get database stats
        stats = db_manager.get_database_stats()
        if stats:
            print("\n📊 Database Statistics:")
            print(f"   Users: {stats['users_count']}")
            print(f"   Rooms: {stats['rooms_count']}")
            print(f"   Reservations: {stats['reservations_count']}")
            print(f"   Payments: {stats['payments_count']}")
            print(f"   Database Size: {stats['database_size_bytes']} bytes")
        
        # Create backup
        backup_path = db_manager.backup_database()
        if backup_path:
            print(f"✅ Database backup created: {backup_path}")
        
        print("\n🎉 Database initialization completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error during database initialization: {e}")
        return False
        
    finally:
        db_manager.disconnect()


if __name__ == "__main__":
    # Run database initialization
    initialize_database()