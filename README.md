# 🧭 Frontend - Sistema de Ventas Financieras

Aplicación frontend desarrollada con **Next.js 14**, **React** y **Tailwind CSS**, diseñada para gestionar las ventas de productos financieros, incluyendo autenticación, gestión de usuarios, registro de ventas y paneles administrativos con estadísticas.

---

## 📂 Estructura General del Proyecto

### Core
- `middleware.js` → Configuración de protección de rutas.  
- `app/layout.jsx` → Layout principal de la aplicación.  
- `app/page.jsx` → Página inicial (redirección al dashboard).  

### Autenticación
- `app/login/page.jsx` → Página de inicio de sesión.  
- `store/authStore.js` → Estado global de autenticación con Zustand.  

### Dashboard
- `app/dashboard/layout.jsx` → Layout con barra de navegación principal.  
- `app/dashboard/page.jsx` → Panel principal de usuario.  

### Ventas
- `app/sales/page.jsx` → Listado de ventas.  
- `app/sales/new/page.jsx` → Formulario para crear una nueva venta.  
- `app/sales/[id]/page.jsx` → Detalle y edición de venta existente.  

### Usuarios (Administrador)
- `app/users/page.jsx` → Listado de usuarios.  
- `app/users/new/page.jsx` → Creación de nuevo usuario.  
- `app/users/[id]/page.jsx` → Edición y detalle de usuario.  

### Estadísticas (Administrador Plus)
- `app/stats/page.jsx` → Panel de estadísticas con datos globales del sistema.  

### Utilidades y Componentes
- `components/` → Componentes reutilizables (Button, Card, Input, Select, etc.).  
- `api/` → Servicios API (auth, sales, stats, users).  
- `utils/format.js` y `utils/axios.js` → Funciones auxiliares de formato y configuración de Axios.  

---

## 🚀 Instalación y Configuración

### 1️⃣ Instalar dependencias
```bash
npm install
# o
yarn install

Configurar variables de entorno

Crea un archivo .env.local en la raíz del proyecto:

NEXT_PUBLIC_API_URL=http://localhost:5000/api

Iniciar el servidor de desarrollo
npm run dev
# o
yarn dev

El frontend estará disponible en:
👉 http://localhost:3000

3000


🧱 Estructura del Proyecto
frontend/
├── app/
│   ├── dashboard/
│   │   ├── layout.jsx
│   │   └── page.jsx
│   ├── login/
│   │   └── page.jsx
│   ├── sales/
│   │   ├── [id]/page.jsx
│   │   ├── new/page.jsx
│   │   └── page.jsx
│   ├── users/
│   │   ├── [id]/page.jsx
│   │   ├── new/page.jsx
│   │   └── page.jsx
│   ├── stats/
│   │   └── page.jsx
│   ├── layout.jsx
│   ├── page.jsx
│   └── globals.css
├── components/
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── Input.jsx
│   └── Select.jsx
├── store/
│   └── authStore.js
├── utils/
│   ├── axios.js
│   └── format.js
└── api/
    ├── auth.js
    ├── sales.js
    ├── stats.js
    └── users.js