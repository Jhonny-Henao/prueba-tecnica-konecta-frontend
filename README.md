# Frontend - Sistema de Ventas Financieras

Frontend desarrollado con Next.js 14, React y Tailwind CSS para gestionar ventas de productos financieros.

## 📦 Archivos Creados

### ✅ Ya tienes implementado:
- `app/login/page.jsx` - Página de login
- `components/` - Componentes (Button, Card, Input, Select)
- `api/` - Servicios API (auth, sales, stats, users)
- `store/authStore.js` - Estado global de autenticación
- `utils/format.js` y `utils/axios.js` - Utilidades

### ✅ Archivos que acabo de crear:

#### Core
- `middleware.js` - Protección de rutas
- `app/layout.jsx` - Layout principal
- `app/page.jsx` - Página de inicio (redirect)

#### Dashboard
- `app/dashboard/layout.jsx` - Layout con navbar
- `app/dashboard/page.jsx` - Dashboard principal

#### Ventas
- `app/sales/page.jsx` - Listado de ventas
- `app/sales/new/page.jsx` - Nueva venta
- `app/sales/[id]/page.jsx` - Detalle y edición de venta

#### Usuarios (Admin)
- `app/users/page.jsx` - Listado de usuarios
- `app/users/new/page.jsx` - Nuevo usuario
- `app/users/[id]/page.jsx` - Detalle y edición de usuario

#### Estadísticas (Admin PLUS)
- `app/stats/page.jsx` - Dashboard de estadísticas

## 🚀 Instalación y Configuración

### 1. Instalar dependencias
```bash
npm install
# o
yarn install
```

### 2. Configurar variables de entorno
Crear archivo `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Iniciar servidor de desarrollo
```bash
npm run dev
# o
yarn dev
```

El frontend estará disponible en: `http://localhost:3000`

## 📋 Dependencias Necesarias

Asegúrate de tener estas dependencias en tu `package.json`:

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "axios": "^1.6.0",
    "js-cookie": "^3.0.5"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

### Instalar dependencias faltantes:
```bash
npm install axios js-cookie
```

## 🎨 Configuración de Tailwind CSS

Ya debes tener configurado Tailwind. Verifica que tengas estos archivos:

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**app/globals.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 📁 Estructura del Proyecto

```
frontend/
├── app/
│   ├── dashboard/
│   │   ├── layout.jsx         ✅ CREADO
│   │   └── page.jsx           ✅ CREADO
│   ├── login/
│   │   └── page.jsx           ✅ CREADO
│   ├── sales/
│   │   ├── [id]/
│   │   │   └── page.jsx       ✅ CREADO
│   │   ├── new/
│   │   │   └── page.jsx       ✅ CREADO
│   │   └── page.jsx           ✅ CREADO
│   ├── users/
│   │   ├── [id]/
│   │   │   └── page.jsx       ✅ CREADO
│   │   ├── new/
│   │   │   └── page.jsx       ✅ CREADO
│   │   └── page.jsx           ✅ CREADO
│   ├── stats/
│   │   └── page.jsx           ✅ CREADO
│   ├── layout.jsx             ✅ CREADO
│   ├── page.jsx               ✅ CREADO
│   └── globals.css            ✅ CREADO
├── components/
│