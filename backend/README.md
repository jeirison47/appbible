# BibliaQuest Backend

Backend API para BibliaQuest - Aplicación de lectura bíblica con gamificación.

## Stack Tecnológico

- **Node.js** 20+
- **Hono** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database (Neon)
- **JWT** - Authentication

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Neon

# Inicializar Prisma
npx prisma init

# Ejecutar migraciones
npm run db:migrate

# Generar cliente Prisma
npm run db:generate

# Ejecutar seed
npm run db:seed
```

## Desarrollo

```bash
# Modo desarrollo (hot reload)
npm run dev

# Build para producción
npm run build

# Ejecutar en producción
npm start

# Ver base de datos (Prisma Studio)
npm run db:studio
```

## Estructura

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── middleware/      # Middleware functions
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   └── index.ts         # Entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data
└── package.json
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Reading
- `GET /api/reading/books` - Listar libros
- `GET /api/reading/books/:slug/:chapter` - Leer capítulo

### Admin (requiere permisos)
- `GET /api/admin/users` - Listar usuarios
- `GET /api/admin/analytics` - Ver analytics

## Usuarios de Prueba

Después de ejecutar el seed:

- **Admin**: `admin@bibliaquest.com` / `admin123`
- **User**: `user@bibliaquest.com` / `user123`

## License

MIT
