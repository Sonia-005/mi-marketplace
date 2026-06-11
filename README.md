# FreelanceLocal — Marketplace de Servicios Freelance

marketplace full-stack para contratar y ofrecer servicios freelance.

## Stack Tecnológico

- **Frontend**: React 18 + Vite + Tailwind CSS + React Router v6
- **Backend**: Node.js + Express + Mongoose
- **Base de datos**: MongoDB Atlas
- **Auth**: JWT + bcrypt
- **Imágenes**: Cloudinary

## Estructura del proyecto

```
mi-marketplace/
├── backend/
│   ├── src/
│   │   ├── models/        # User, Service, Order, Review, Message
│   │   ├── routes/        # auth, services, orders, reviews, messages, users
│   │   ├── middleware/    # authMiddleware, roleMiddleware, upload (Cloudinary)
│   │   ├── index.js       # Punto de entrada del servidor
│   │   └── seed.js        # Script para poblar datos de prueba
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/         # Home, Services, ServiceDetail, Dashboard, etc.
    │   ├── components/    # Navbar, ServiceCard, StatusBadge, Spinner
    │   ├── context/       # AuthContext (JWT + estado global)
    │   ├── api.js         # Cliente Axios con interceptor de token
    │   └── main.jsx
    ├── .env.example
    └── package.json
```

## Instalación local

### Prerrequisitos
- Node.js 18+
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
- Cuenta en [Cloudinary](https://cloudinary.com)

### 1. Clonar y configurar variables de entorno

```bash
# Backend
cd backend
cp .env.example .env
# Edita .env con tus credenciales reales
```

```bash
# Frontend
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api (por defecto)
```

### 2. Instalar dependencias

```bash
# En la carpeta backend/
npm install

# En la carpeta frontend/
npm install
```

### 3. Ejecutar el seed (datos de prueba)

```bash
cd backend
npm run seed
```

Esto crea 3 usuarios de demo y 6 servicios de ejemplo:

| Nombre | Email | Contraseña | Rol |
|--------|-------|-----------|-----|
| Admin Demo | admin@freelancelocal.com | Admin1234 | freelancer |
| Cliente Demo | cliente@freelancelocal.com | Cliente1234 | client |
| Freelancer Demo | freelancer@freelancelocal.com | Freelancer1234 | freelancer |

### 4. Iniciar en modo desarrollo

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Corre en http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# Corre en http://localhost:5173
```

## Variables de entorno

### backend/.env

```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/freelance-marketplace
JWT_SECRET=cadena_aleatoria_muy_larga_y_segura
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### frontend/.env

```env
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Registrar usuario |
| POST | /api/auth/login | No | Iniciar sesión |
| GET | /api/services | No | Listar servicios (filtros: category, minPrice, maxPrice, search) |
| GET | /api/services/:id | No | Detalle de servicio |
| POST | /api/services | Freelancer | Crear servicio |
| PUT | /api/services/:id | Freelancer (dueño) | Editar servicio |
| DELETE | /api/services/:id | Freelancer (dueño) | Desactivar servicio |
| POST | /api/orders | Cliente | Contratar servicio |
| GET | /api/orders/my | Auth | Mis órdenes |
| GET | /api/orders/:id | Participante | Detalle de orden |
| PATCH | /api/orders/:id/status | Participante | Cambiar estado |
| POST | /api/reviews | Cliente | Crear reseña |
| GET | /api/reviews/freelancer/:userId | No | Reseñas de un freelancer |
| GET | /api/messages/:orderId | Participante | Historial de mensajes |
| POST | /api/messages | Participante | Enviar mensaje |
| GET | /api/users/profile/:id | No | Perfil público |
| PUT | /api/users/me | Auth | Editar mi perfil |

## Deploy 

### Backend en Render

### Frontend en Vercel

- **Registro/Login** con selector de rol (cliente o freelancer)
- **Explorar servicios** con filtros por categoría, precio y búsqueda de texto
- **Perfil de freelancer** con servicios activos y rating promedio
- **Contratar servicios** con formulario de requisitos
- **Panel de órdenes** con badges de estado por color
- **Chat interno** por orden con polling cada 5 segundos
- **Sistema de reseñas** (1-5 estrellas) para órdenes completadas
- **Subida de imágenes** a Cloudinary (servicios y avatares)
- **Gestión de servicios** (crear, editar, activar/desactivar)
