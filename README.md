# 🏨 Pacific Reef – Demo UI

Sitio en vivo: https://mk-vzla.github.io/PacificReef/index.html

Interfaz demostrativa de gestión hotelera. Todo corre en el navegador con datos mock en memoria (sin backend conectado). Ideal para mostrar flujos básicos: login, panel admin, panel cliente, reservas y exploración de habitaciones.

## Abrir localmente (Live Server)
Opción rápida recomendada:
1. Abre la carpeta del proyecto en VS Code.
2. Instala (si no la tienes) la extensión “Live Server”.
3. Clic derecho en `index.html` → "Open with Live Server".
4. El navegador se abre en `http://localhost:5500` (o puerto similar) y listo.

## Uso rápido
Abrir `index.html` (o usar el enlace live), iniciar sesión con una credencial y navegar. Sin builds, sin dependencias adicionales.

Credenciales de prueba: cliente `client / client123` · admin `admin / admin123`.

## Qué incluye (breve)
Login ligero → redirección según rol. Panel admin: usuarios, habitaciones, reservas, estadísticas ficticias. Panel cliente: habitaciones destacadas, reservas personales, perfil ampliado. Códigos de reserva formateados. Tema oscuro único. Todo editable tocando `js/api.js`.

## Estructura mínima
`index.html`, `admin.html`, `client.html`, `register.html`, carpeta `css/` (estilos), carpeta `js/` (auth, api, lógica de paneles), y módulos opcionales (`backend/`, `analytics/`, `database/`). Puede existir `frontend/` si se centraliza una versión reorganizada.

## Backend futuro
Carpeta `backend/` (Spring Boot) lista para convertirse en origen real de datos: solo habría que reemplazar llamadas mock por fetch y mapear respuestas.

## Limitado a propósito
Sin persistencia real, reportes simulados, validaciones mínimas. Se prioriza claridad visual y flujo.

## Próximo paso sugerido
Sustituir `api.js` por endpoints REST y añadir autenticación real (JWT / sesiones) manteniendo firmas async.

Listo. Abre el sitio y explora. 🌊

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
