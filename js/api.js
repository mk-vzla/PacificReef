// API Service - Real Backend Integration (Flask)
const API_BASE = 'http://127.0.0.1:5000/api';

export async function getUsers() {
    const res = await fetch(`${API_BASE}/usuarios`);
    return await res.json();
}

export async function getRooms() {
    const res = await fetch(`${API_BASE}/habitaciones`);
    return await res.json();
}

export async function getReservations() {
    const res = await fetch(`${API_BASE}/reservas`);
    return await res.json();
}

export async function createReservation(data) {
    const res = await fetch(`${API_BASE}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await res.json();
}

// Puedes agregar más funciones para crear/editar/eliminar usuarios y habitaciones si agregas los endpoints en Flask.

// Ejemplo de uso:
// import { getRooms, getReservations } from './api.js';
// const rooms = await getRooms();
// const reservations = await getReservations();