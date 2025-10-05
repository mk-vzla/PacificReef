import sqlite3
import os

DB_NAME = "hotel_management.db"

def create_database():
    # Eliminar la base de datos si existe
    if os.path.exists(DB_NAME):
        os.remove(DB_NAME)

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # Crear tabla de usuarios con username
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            nombre TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            rol TEXT NOT NULL CHECK(rol IN ('admin', 'client')),
            estado TEXT DEFAULT 'activo'
        )
    """)

        # Crear tabla usuario_extend con campos opcionales para perfil
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS usuario_extend (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL UNIQUE,
            nombre_completo TEXT,
            apellido TEXT,
            email TEXT,
            telefono TEXT,
            fecha_nacimiento DATE,
            ciudad TEXT,
            pais TEXT,
            direccion TEXT,
            notificaciones INTEGER DEFAULT 1,
            activo INTEGER DEFAULT 1,
            confirmaciones_email INTEGER DEFAULT 1,
            recibir_correos_reserva INTEGER DEFAULT 1,
            protegido INTEGER DEFAULT 1,
            autenticacion_2fa INTEGER DEFAULT 0,
            metodo_pago TEXT,
            tarjeta TEXT,
            expira TEXT,
            preferida INTEGER DEFAULT 1,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        )
    """)

    # Crear tabla de habitaciones con todos los campos del frontend
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS habitaciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero TEXT NOT NULL,
            nombre TEXT NOT NULL,
            tipo TEXT NOT NULL CHECK(tipo IN ('suite', 'deluxe', 'standard', 'villa')),
            piso INTEGER NOT NULL,
            estado TEXT DEFAULT 'disponible' CHECK(estado IN ('disponible', 'ocupada', 'mantenimiento', 'limpieza', 'fuera de servicio')),
            capacidad INTEGER NOT NULL,
            precio_base REAL NOT NULL,
            precio_actual REAL NOT NULL,
            ultima_limpieza DATE,
            reservas_pendientes INTEGER DEFAULT 0,
            amenidades TEXT
        )
    """)

    # Crear tabla de reservas con los campos del frontend
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reservas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo TEXT UNIQUE NOT NULL,
            usuario_id INTEGER NOT NULL,
            habitacion_id INTEGER NOT NULL,
            fecha_inicio DATE NOT NULL,
            fecha_fin DATE NOT NULL,
            monto_total REAL NOT NULL,
            pago TEXT NOT NULL CHECK(pago IN ('Pagado', 'Pago Pendiente', 'N/A')),
            estado TEXT DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'confirmada', 'completada', 'anulada')),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
            FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id)
        )
    """)

    conn.commit()

    # Insertar datos ficticios
    # Usuarios mock del frontend (20 usuarios)
    usuarios = [
        ("admin", "Administrador Hotel", "admin@pacificreef.com", "admin123", "admin", "activo"),
        ("client", "Cliente Demo", "client@pacificreef.com", "client123", "client", "activo"),
        ("csilva", "Cristóbal Silva", "csilva@demo.com", "demo123", "client", "activo"),
        ("acorrea", "Antonia Correa", "acorrea@demo.com", "demo123", "client", "activo"),
        ("jrios", "Javiera Ríos", "jrios@demo.com", "demo123", "client", "activo"),
        ("ftorres", "Felipe Torres", "ftorres@demo.com", "demo123", "client", "activo"),
        ("csoto", "Camila Soto", "csoto@demo.com", "demo123", "client", "activo"),
        ("iparedes", "Ignacio Paredes", "iparedes@demo.com", "demo123", "client", "activo"),
        ("vdiaz", "Valentina Díaz", "vdiaz@demo.com", "demo123", "client", "activo"),
        ("mfuentes", "Matías Fuentes", "mfuentes@demo.com", "demo123", "client", "activo"),
        ("sherrera", "Sofía Herrera", "sherrera@demo.com", "demo123", "client", "activo"),
        ("dcastro", "Diego Castro", "dcastro@demo.com", "demo123", "client", "activo"),
        ("fmunoz", "Francisca Muñoz", "fmunoz@demo.com", "demo123", "client", "activo"),
        ("tgonzalez", "Tomás González", "tgonzalez@demo.com", "demo123", "client", "activo"),
        ("mlopez", "Martina López", "mlopez@demo.com", "demo123", "client", "activo"),
        ("breyes", "Benjamín Reyes", "breyes@demo.com", "demo123", "client", "activo"),
        ("ivargas", "Isidora Vargas", "ivargas@demo.com", "demo123", "client", "activo"),
        ("extra1", "Usuario Extra 1", "extra1@demo.com", "demo123", "client", "activo"),
        ("extra2", "Usuario Extra 2", "extra2@demo.com", "demo123", "client", "activo"),
        ("extra3", "Usuario Extra 3", "extra3@demo.com", "demo123", "client", "activo"),
        ("extra4", "Usuario Extra 4", "extra4@demo.com", "demo123", "client", "activo"),
    ]
    cursor.executemany("""
        INSERT INTO usuarios (username, nombre, email, password, rol, estado)
        VALUES (?, ?, ?, ?, ?, ?)
    """, usuarios)

        # Insertar datos ficticios en usuario_extend
    usuario_extend = [
        (1, "Administrador Hotel", "Admin", "admin@pacificreef.com", "+56911111111", "1980-01-01", "Santiago", "Chile", "Av. Pacific 123", 1, 1, 1, 1, 1, 1, "VISA", "**** **** **** 4242", "12/28", 1),
        (2, "Cliente Demo", "Demo", "client@pacificreef.com", "+56922222222", "1990-05-15", "Valparaíso", "Chile", "Calle Demo 456", 1, 1, 1, 1, 1, 0, "VISA", "**** **** **** 4242", "12/28", 1),
    ]
    cursor.executemany("""
        INSERT INTO usuario_extend (usuario_id, nombre_completo, apellido, email, telefono, fecha_nacimiento, ciudad, pais, direccion, notificaciones, activo, confirmaciones_email, recibir_correos_reserva, protegido, autenticacion_2fa, metodo_pago, tarjeta, expira, preferida)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, usuario_extend)

    # Habitaciones mock del frontend (8 habitaciones)
    habitaciones = [
        ("101", "Suite Premium", "suite", 1, "disponible", 4, 450, 450, "2025-10-04", 2, "WiFi,Estacionamiento,Aire Acondicionado,Bañera Jacuzzi,Vista al Mar"),
        ("102", "Habitación Deluxe", "deluxe", 2, "disponible", 2, 280, 280, "2025-10-03", 1, "WiFi,Estacionamiento,Aire Acondicionado,Minibar"),
        ("103", "Habitación Standard", "standard", 1, "ocupada", 2, 180, 180, "2025-10-02", 1, "WiFi,Aire Acondicionado,TV Cable"),
        ("104", "Villa Familiar", "villa", 2, "disponible", 6, 650, 650, "2025-10-01", 1, "WiFi,Estacionamiento,Piscina Privada,Cocina Completa,Acceso a Playa"),
        ("105", "Habitación Deluxe Plus", "deluxe", 3, "mantenimiento", 2, 320, 320, "2025-09-30", 0, "WiFi,Aire Acondicionado,Minibar,Balcón"),
        ("106", "Suite Ejecutiva", "suite", 4, "limpieza", 3, 500, 500, "2025-10-05", 0, "WiFi,Estacionamiento,Aire Acondicionado,Jacuzzi"),
        ("107", "Habitación Fuera de Servicio 1", "standard", 1, "fuera de servicio", 2, 150, 150, "2025-09-28", 0, "WiFi,Aire Acondicionado"),
        ("108", "Habitación Fuera de Servicio 2", "deluxe", 2, "fuera de servicio", 2, 220, 220, "2025-09-27", 0, "WiFi,Minibar"),
    ]
    cursor.executemany("""
        INSERT INTO habitaciones (numero, nombre, tipo, piso, estado, capacidad, precio_base, precio_actual, ultima_limpieza, reservas_pendientes, amenidades)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, habitaciones)

    # Reservas mock del frontend (20 reservas)
    reservas = [
        ("PR-2025-001", 2, 1, "2025-09-28", "2025-09-30", 400, "Pagado", "completada"),
        ("PR-2025-002", 2, 2, "2025-10-01", "2025-10-03", 250, "Pagado", "completada"),
        ("PR-2025-003", 2, 3, "2025-10-05", "2025-10-06", 300, "Pago Pendiente", "confirmada"),
        ("PR-2025-004", 2, 4, "2025-10-06", "2025-10-07", 600, "Pago Pendiente", "pendiente"),
        ("PR-2025-005", 2, 5, "2025-09-20", "2025-09-22", 200, "N/A", "anulada"),
        ("PR-2025-006", 3, 1, "2025-10-05", "2025-10-06", 250, "Pago Pendiente", "confirmada"),
        ("PR-2025-007", 4, 2, "2025-10-06", "2025-10-07", 300, "Pago Pendiente", "pendiente"),
        ("PR-2025-008", 5, 3, "2025-09-15", "2025-09-18", 350, "N/A", "anulada"),
        ("PR-2025-009", 6, 4, "2025-09-25", "2025-09-28", 400, "N/A", "anulada"),
        ("PR-2025-010", 7, 5, "2025-09-16", "2025-09-18", 450, "Pagado", "completada"),
        ("PR-2025-011", 8, 6, "2025-09-17", "2025-09-19", 500, "Pagado", "completada"),
        ("PR-2025-012", 9, 7, "2025-09-18", "2025-09-20", 550, "Pagado", "completada"),
        ("PR-2025-013", 10, 8, "2025-09-19", "2025-09-21", 600, "Pagado", "completada"),
        ("PR-2025-014", 11, 1, "2025-09-20", "2025-09-22", 650, "Pagado", "completada"),
        ("PR-2025-015", 12, 2, "2025-09-21", "2025-09-23", 700, "Pagado", "completada"),
        ("PR-2025-016", 13, 3, "2025-09-22", "2025-09-24", 750, "Pagado", "completada"),
        ("PR-2025-017", 14, 4, "2025-09-23", "2025-09-25", 800, "Pagado", "completada"),
        ("PR-2025-018", 15, 5, "2025-09-24", "2025-09-26", 850, "Pagado", "completada"),
        ("PR-2025-019", 16, 6, "2025-09-25", "2025-09-27", 900, "Pagado", "completada"),
        ("PR-2025-020", 17, 7, "2025-09-26", "2025-09-28", 950, "Pagado", "completada"),
    ]
    cursor.executemany("""
        INSERT INTO reservas (codigo, usuario_id, habitacion_id, fecha_inicio, fecha_fin, monto_total, pago, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, reservas)

    conn.commit()
    conn.close()
    print("Base de datos actualizada y poblada correctamente.")

if __name__ == "__main__":
    create_database()
