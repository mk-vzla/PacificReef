# 🏨 Pacific Reef Hotel Management System

Sistema de gestión hotelera (UI 100% mock) con separación clara de páginas y posibilidad de integrar backend Spring Boot opcional.

## 🚀 Inicio Rápido

### Frontend (Mock – Recomendado)

1. Abrir VS Code en la carpeta raíz `PacificReef/`
2. Extensión sugerida: Live Server
3. Clic derecho en `index.html` → "Open with Live Server"
4. Ingresar credenciales de demostración
5. Serás redirigido a `admin.html` o `client.html` según el rol

No existen llamadas de red: todos los datos se generan en memoria dentro de `js/api.js`.

### Credenciales de Acceso

- **Cliente**: `client` / `client123`
- **Administrador**: `admin` / `admin123`

## 📁 Estructura del Proyecto

```
PacificReef/
├── index.html          # Página de login (minimal, solo formulario + link registro)
├── register.html       # Alta mock (sin lógica de persistencia real)
├── admin.html          # Dashboard administrador standalone
├── client.html         # Dashboard cliente standalone
├── css/                # Estilos globales y componentes
├── js/
│   ├── auth.js         # Login + sesión mock (localStorage)
│   ├── api.js          # Servicio de datos mock (usuarios, habitaciones, reservas)
│   ├── admin.js        # Lógica del panel admin
│   └── client.js       # Lógica del panel cliente
├── backend/            # Backend Spring Boot (opcional, no conectado aún a la UI mock)
├── analytics/          # Scripts Python de analítica
└── database/           # SQLite / scripts utilitarios
```

## ✨ Características

### Frontend (Mock)

- ✅ Autenticación simulada (localStorage)
- ✅ Páginas separadas: login / admin / cliente / registro
- ✅ Gestión mock: habitaciones (cards + filtros avanzados), reservas (códigos PR-YYYY-XXX, filtros, quick filters), usuarios (tabla filtrable)
- ✅ Reportes mock con tarjetas e indicadores
- ✅ Perfil cliente extendido (datos personales, notificaciones, seguridad, métodos de pago)
- ✅ Normalización estados ("Anulada" en lugar de "Cancelada")
- ✅ Tema oscuro unificado y badges de estado contrastados
- ✅ Datos mock enriquecidos (amenities, imágenes simuladas, pricing dinámico)

### Backend (Opcional / Aún desacoplado de la UI mock)

- Spring Boot listo para extender (estructura base en `backend/`)
- Endpoints de autenticación (AuthController) preparados para futura integración JWT
- Persistencia configurada con H2 en memoria (modo dev)
- Preparado para migración desde mock a real sustituyendo llamadas de `api.js`

### Ejecutar Backend (Opcional)

```bash
cd backend
mvn spring-boot:run
```

Luego disponible en: `http://localhost:8080/api` (Swagger si se activa configuración OpenAPI).

### Estrategia de Migración (Mock → Real)
1. Reemplazar métodos de `api.js` por fetch/axios a endpoints reales
2. Sustituir login mock en `auth.js` por POST `/auth/login`
3. Mapear response JWT al almacenamiento local (token + role)
4. Sustituir datasets fijos por respuestas paginadas / filtradas
5. Retirar gradualmente banderas mock y mensajes de consola

### Limpiezas y Refactors Recientes
- Eliminado dashboard embebido dentro de `index.html`
- Eliminado `main.js` (no referenciado tras separación de páginas)
- Eliminadas funciones obsoletas de vista interna en `auth.js`
- Añadidos encabezados de documentación a módulos JS principales
- Simplificado flujo de registro (solo enlace)
- Separada lógica admin/cliente en HTML independientes

### Pruebas Rápidas Manuales
1. Login como admin → redirección a `admin.html`
2. Ver habitaciones: filtros por estado/tipo/piso + tarjetas resumen
3. Ver reservas: códigos PR ordenados, quick filters (Hoy / Pronto / Completada / Anulada)
4. Cambiar a cliente → validar filtros de reservas y botones de acción según estado
5. Editar perfil cliente → refrescar página y confirmar persistencia localStorage

### Limitaciones Conocidas
- Sin persistencia real (todo en memoria)
- Sin validaciones de formulario robustas en registro
- Sin control real de roles desde backend (mock local)

---
**🏨 Pacific Reef Hotel Management System – Versión Mock Optimizada**

**🏨 ¡Disfruta usando Pacific Reef Hotel Management System!**
