def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM usuarios WHERE username=? AND password=? AND rol=?', (username, password, role)).fetchone()
    conn.close()
    if user:
        user_dict = dict(user)
        # Map fields to frontend
        user_dict['name'] = user_dict.get('nombre')
        user_dict['role'] = user_dict.get('rol')
        user_dict['status'] = user_dict.get('estado')
        return jsonify({ 'success': True, 'user': user_dict })
    else:
        return jsonify({ 'success': False, 'message': 'Credenciales inválidas' }), 401

from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3

DB_NAME = 'hotel_management.db'
app = Flask(__name__)
CORS(app)

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

# --- HABITACIONES ---
@app.route('/api/habitaciones', methods=['GET'])
def get_habitaciones():
    conn = get_db_connection()
    habitaciones = conn.execute('SELECT * FROM habitaciones').fetchall()
    result = []
    for row in habitaciones:
        r = dict(row)
        # amenities stored as comma-separated string, convert to array
        r['amenities'] = r.get('amenidades', '').split(',') if r.get('amenidades') else []
        r['number'] = r.get('numero')
        r['name'] = r.get('nombre')
        r['type'] = r.get('tipo')
        r['floor'] = r.get('piso')
        r['status'] = r.get('estado')
        r['capacity'] = r.get('capacidad')
        r['basePrice'] = r.get('precio_base')
        r['currentPrice'] = r.get('precio_actual')
        r['lastCleaned'] = r.get('ultima_limpieza')
        r['reservations'] = r.get('reservas_pendientes')
        result.append(r)
    conn.close()
    return jsonify({ 'data': result })

# Create room
@app.route('/api/habitaciones', methods=['POST'])
def create_habitacion():
    data = request.json
    conn = get_db_connection()
    cur = conn.execute(
        'INSERT INTO habitaciones (numero, nombre, tipo, piso, estado, amenidades, capacidad, precio_base, precio_actual, ultima_limpieza, reservas_pendientes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        (
            data.get('number'), data.get('name'), data.get('type'), data.get('floor'), data.get('status'), ','.join(data.get('amenities', [])),
            data.get('capacity'), data.get('basePrice'), data.get('currentPrice'), data.get('lastCleaned'), data.get('reservations', 0)
        )
    )
    conn.commit()
    room_id = cur.lastrowid
    conn.close()
    return jsonify({ 'message': 'Habitación creada', 'data': { 'id': room_id } }), 201

# Update room
@app.route('/api/habitaciones/<int:room_id>', methods=['PUT'])
def update_habitacion(room_id):
    data = request.json
    conn = get_db_connection()
    conn.execute(
        'UPDATE habitaciones SET numero=?, nombre=?, tipo=?, piso=?, estado=?, amenidades=?, capacidad=?, precio_base=?, precio_actual=?, ultima_limpieza=?, reservas_pendientes=? WHERE id=?',
        (
            data.get('number'), data.get('name'), data.get('type'), data.get('floor'), data.get('status'), ','.join(data.get('amenities', [])),
            data.get('capacity'), data.get('basePrice'), data.get('currentPrice'), data.get('lastCleaned'), data.get('reservations', 0), room_id
        )
    )
    conn.commit()
    conn.close()
    return jsonify({ 'message': 'Habitación actualizada' })

# Delete room
@app.route('/api/habitaciones/<int:room_id>', methods=['DELETE'])
def delete_habitacion(room_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM habitaciones WHERE id=?', (room_id,))
    conn.commit()
    conn.close()
    return jsonify({ 'message': 'Habitación eliminada' })

# --- RESERVAS ---
@app.route('/api/reservas', methods=['GET'])
def get_reservas():
    conn = get_db_connection()
    # Join with users and rooms for frontend fields
    query = '''
        SELECT r.id, r.codigo as code, u.nombre as userName, h.numero as roomNumber, r.fecha_inicio as checkIn, r.fecha_fin as checkOut,
               r.monto_total as totalAmount, r.estado as status, r.pago as payment, r.usuario_id, r.habitacion_id
        FROM reservas r
        LEFT JOIN usuarios u ON r.usuario_id = u.id
        LEFT JOIN habitaciones h ON r.habitacion_id = h.id
    '''
    reservas = conn.execute(query).fetchall()
    result = []
    for row in reservas:
        r = dict(row)
        r['guests'] = 1 # Si quieres agregar campo de huéspedes, ajusta aquí
        r['userId'] = r.get('usuario_id')
        result.append(r)
    conn.close()
    return jsonify({ 'data': result })

# Create reservation
@app.route('/api/reservas', methods=['POST'])
def crear_reserva():
    data = request.json
    conn = get_db_connection()
    cur = conn.execute(
        'INSERT INTO reservas (codigo, usuario_id, habitacion_id, fecha_inicio, fecha_fin, monto_total, pago, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        (
            data.get('code'), data.get('usuario_id'), data.get('habitacion_id'), data.get('checkIn'), data.get('checkOut'),
            data.get('totalAmount'), data.get('payment'), data.get('status')
        )
    )
    conn.commit()
    res_id = cur.lastrowid
    conn.close()
    return jsonify({ 'message': 'Reserva creada', 'data': { 'id': res_id } }), 201

# Update reservation
@app.route('/api/reservas/<int:res_id>', methods=['PUT'])
def update_reserva(res_id):
    data = request.json
    conn = get_db_connection()
    conn.execute(
        'UPDATE reservas SET codigo=?, usuario_id=?, habitacion_id=?, fecha_inicio=?, fecha_fin=?, monto_total=?, pago=?, estado=? WHERE id=?',
        (
            data.get('code'), data.get('usuario_id'), data.get('habitacion_id'), data.get('checkIn'), data.get('checkOut'),
            data.get('totalAmount'), data.get('payment'), data.get('status'), res_id
        )
    )
    conn.commit()
    conn.close()
    return jsonify({ 'message': 'Reserva actualizada' })

# Delete/cancel reservation
@app.route('/api/reservas/<int:res_id>', methods=['DELETE'])
def delete_reserva(res_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM reservas WHERE id=?', (res_id,))
    conn.commit()
    conn.close()
    return jsonify({ 'message': 'Reserva eliminada/anulada' })

# --- USUARIOS ---
@app.route('/api/usuarios', methods=['GET'])
def get_usuarios():
    conn = get_db_connection()
    usuarios = conn.execute('SELECT * FROM usuarios').fetchall()
    result = []
    for row in usuarios:
        r = dict(row)
        r['name'] = r.get('nombre')
        r['role'] = r.get('rol')
        r['status'] = r.get('estado')
        result.append(r)
    conn.close()
    return jsonify({ 'data': result })

# Create user
@app.route('/api/usuarios', methods=['POST'])
def create_usuario():
    data = request.json
    conn = get_db_connection()
    try:
        cur = conn.execute(
            'INSERT INTO usuarios (username, nombre, email, password, rol, estado) VALUES (?, ?, ?, ?, ?, ?)',
            (
                data.get('username'),
                data.get('name'),
                data.get('email'),
                data.get('password'),
                data.get('role'),
                data.get('status')
            )
        )
        conn.commit()
        user_id = cur.lastrowid
        conn.close()
        return jsonify({ 'message': 'Usuario creado', 'data': { 'id': user_id } }), 201
    except Exception as e:
        conn.rollback()
        conn.close()
        if 'UNIQUE constraint failed' in str(e):
            return jsonify({ 'message': 'El usuario o email ya existe.' }), 400
        return jsonify({ 'message': 'Error al registrar usuario.' }), 500

# Update user
@app.route('/api/usuarios/<int:user_id>', methods=['PUT'])
def update_usuario(user_id):
    data = request.json
    conn = get_db_connection()
    conn.execute(
        'UPDATE usuarios SET nombre=?, email=?, rol=?, estado=? WHERE id=?',
        (data.get('name'), data.get('email'), data.get('role'), data.get('status'), user_id)
    )
    conn.commit()
    conn.close()
    return jsonify({ 'message': 'Usuario actualizado' })

# Delete user
@app.route('/api/usuarios/<int:user_id>', methods=['DELETE'])
def delete_usuario(user_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM usuarios WHERE id=?', (user_id,))
    conn.commit()
    conn.close()
    return jsonify({ 'message': 'Usuario eliminado' })

@app.route('/api/login', methods=['POST'])
def login_route():
    return login()

if __name__ == '__main__':
    app.run(debug=True)
