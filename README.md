# ÑamFod

Plataforma de pedidos de comida enfocada en entorno escolar.

## Descripción

ÑamFod es una plataforma de pedidos y pequeño ERP para la administración de establecimientos de comida en entorno escolar. Permite a clientes realizar pedidos, a restaurantes gestionar sus productos e inventario, a repartidores gestionar entregas y a administradores supervisar toda la plataforma.

## Tecnologías

- **Frontend:** React Native + React Native Web + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Base de datos:** MongoDB Atlas + Mongoose
- **Autenticación:** JWT + bcrypt
- **Testing:** Jest + Supertest + React Native Testing Library

## Estructura del proyecto

```
ÑamFod/
├── backend/          # API Node.js + Express
│   ├── src/
│   │   ├── config/       # Configuración (env, database)
│   │   ├── controllers/  # Controladores
│   │   ├── middleware/   # Middlewares (auth, errores)
│   │   ├── models/       # Modelos Mongoose
│   │   ├── routes/       # Rutas de la API
│   │   ├── services/     # Lógica de negocio
│   │   ├── types/        # Tipos TypeScript
│   │   └── utils/        # Utilidades
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/         # App React Native + Web
    ├── src/
    │   ├── assets/       # Recursos estáticos
    │   ├── components/   # Componentes reutilizables
    │   ├── screens/      # Pantallas por rol
    │   ├── navigation/   # Configuración de navegación
    │   ├── services/     # Servicios de API
    │   ├── hooks/        # Custom hooks
    │   ├── context/      # Context API
    │   ├── constants/    # Constantes
    │   ├── types/        # Tipos TypeScript
    │   ├── utils/        # Utilidades
    │   └── theme/        # Tema (colores, espaciado)
    ├── package.json
    └── tsconfig.json
```

## Roles del sistema

| Rol | Descripción |
|-----|-------------|
| **CUSTOMER** | Realiza pedidos, consulta menús, califica pedidos |
| **RESTAURANT** | Administra productos, inventario, pedidos y ventas |
| **DELIVERY** | Gestiona entregas y valida códigos |
| **ADMIN** | Administra toda la plataforma |

## Configuración

### Backend

```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run web
```

## API

La API corre en `http://localhost:5000/api`

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/auth/register` | POST | Registro de usuario |
| `/api/auth/login` | POST | Inicio de sesión |
| `/api/auth/me` | GET | Usuario actual |
| `/api/restaurants` | GET/POST | Restaurantes |
| `/api/products` | GET/POST | Productos |
| `/api/orders` | GET/POST | Pedidos |
| `/api/inventory` | GET | Inventario |

## Fases de desarrollo

1. ✅ Auditoría del proyecto
2. ✅ Arquitectura base
3. ⏳ Autenticación
4. ⏳ Restaurantes
5. ⏳ Categorías y productos
6. ⏳ Carrito
7. ⏳ Pedidos
8. ⏳ Inventario
9. ⏳ Panel RESTAURANT
10. ⏳ DELIVERY
11. ⏳ ADMIN
12. ⏳ Reportes
13. ⏳ QA
14. ⏳ Revisión final

## Licencia

Privado - ÑamFod
