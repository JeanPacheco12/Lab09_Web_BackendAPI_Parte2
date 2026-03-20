# Modulo 3 - RealEstate Hub API

## Full-Stack: Backend API + Frontend React

> Proyecto completo con backend Express/Prisma y frontend React que lo consume.

---

## Estructura del Proyecto

```
module3-realestate-hub-api/
├── backend/                 # API REST con Express y Prisma
│   ├── src/
│   │   ├── server.ts
│   │   ├── controllers/
│   │   ├── repositories/
│   │   ├── routes/
│   │   └── types/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
│
├── frontend/                # React SPA que consume la API
│   ├── src/
│   │   ├── services/api.ts # Llamadas fetch a la API con propertyService
│   │   ├── pages/
│   │   └── components/
│   └── package.json
│
├── slides/                  # Presentacion del modulo
└── README.md                # Esta documentacion
```

---

## Stack Tecnologico

### Backend

| Dependencia | Version |
|-------------|---------|
| Express | 5.2.1 |
| Prisma | 7.2.0 |
| TypeScript | 5.9.3 |
| Zod | 4.1.9 |

### Frontend

| Dependencia | Version |
|-------------|---------|
| React | 19.2.1 |
| Vite | 7.3.0 |
| TypeScript | 5.9.3 |
| Tailwind CSS | 4.1.8 |

---

## Inicio Rapido

### 1. Backend

```bash
cd backend

# Instalar dependencias
npm install --legacy-peer-deps

# Generar cliente Prisma
npm run db:generate

# Crear base de datos
npm run db:push

# Sembrar datos de ejemplo
npm run db:seed

# Iniciar servidor (puerto 3002)
npm run dev
```

### 2. Frontend

```bash
cd frontend

# Instalar dependencias
npm install --legacy-peer-deps

# Iniciar servidor (puerto 3001)
npm run dev
```

### 3. Abrir en navegador

- Frontend: http://localhost:3001
- API: http://localhost:3002/api/properties

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ARQUITECTURA                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌─────────────────────┐         ┌─────────────────────┐                  │
│    │      FRONTEND       │         │       BACKEND       │                  │
│    │    (React + Vite)   │         │  (Express + Prisma) │                  │
│    │    localhost:3001   │         │   localhost:3002    │                  │
│    └──────────┬──────────┘         └──────────┬──────────┘                  │
│               │                               │                              │
│               │  HTTP REST (fetch)            │                              │
│               │  GET/POST/PUT/DELETE          │                              │
│               └───────────────────────────────┤                              │
│                                               │                              │
│                                               ▼                              │
│                                    ┌─────────────────────┐                  │
│                                    │      DATABASE       │                  │
│                                    │      (SQLite)       │                  │
│                                    │    prisma/dev.db    │                  │
│                                    └─────────────────────┘                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Configuracion de Puertos

Frontend y backend corren en puertos separados para simular un entorno de produccion:

| Componente | Puerto | URL |
|------------|--------|-----|
| Frontend (Vite) | 3001 | http://localhost:3001 |
| Backend (Express) | 3002 | http://localhost:3002 |

### Conectividad

El frontend se conecta al backend usando la URL base definida en `frontend/src/services/api.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
```

El backend tiene CORS configurado para aceptar peticiones desde el frontend:

```typescript
// backend/src/server.ts
app.use(cors({
  origin: 'http://localhost:3001'
}));
```

---

## Refactorizacion del Frontend

El frontend (copia del Modulo 2) fue refactorizado para usar la API en lugar de localStorage:

### Cambios principales

| Archivo | Antes (Modulo 2) | Despues (Modulo 3) |
|---------|------------------|---------------------|
| `lib/storage.ts` | localStorage sync | No usado |
| `services/api.ts` | No existia | fetch() async (Wrapper) |
| `pages/HomePage.tsx` | `filterProperties()` sync | `await filterProperties()` async |
| `pages/NewPropertyPage.tsx` | `createProperty()` sync | `await createProperty()` async |
| `pages/PropertyDetailPage.tsx` | `getPropertyById()` sync | `await getPropertyById()` async |

### Patron de refactorizacion

```typescript
// ANTES (Modulo 2): Operaciones sincronas
const loadProperties = useCallback(() => {
  const filtered = filterProperties(filters);
  setProperties(filtered);
}, [filters]);

// DESPUES (Modulo 3): Operaciones asincronas
const loadProperties = useCallback(async () => {
  setIsLoading(true);
  try {
    const filtered = await filterProperties(filters);
    setProperties(filtered);
  } finally {
    setIsLoading(false);
  }
}, [filters]);
```

### Estado de carga

Se agrego estado `isLoading` para mostrar indicadores mientras se cargan datos:

```typescript
const [isLoading, setIsLoading] = useState(true);

// En el JSX
{isLoading ? (
  <p>Cargando propiedades...</p>
) : (
  <PropertyList properties={properties} />
)}
```

---

## Contexto Pedagogico

Este modulo demuestra la transicion de una app con localStorage (Modulo 2) a una arquitectura cliente-servidor:

### De localStorage a API REST

```typescript
// Modulo 2: Datos locales (sincrono)
const properties = getAllProperties();

// Modulo 3: Datos del servidor (async)
const properties = await fetch('/api/properties')
  .then(r => r.json())
  .then(r => r.data);
```

### Patron Repository (Backend)

```typescript
// Controller: maneja HTTP
export async function getAllProperties(req, res) {
  const properties = await propertyRepository.findAll(filters);
  res.json({ success: true, data: properties });
}

// Repository: acceso a datos
export const propertyRepository = {
  async findAll(filters) {
    return prisma.property.findMany({ where: buildWhere(filters) });
  }
};
```

---

## Endpoints de la API

| Metodo | Endpoint               | Descripcion                     |
|--------|------------------------|---------------------------------|
| GET    | /health                | Health check                    |
| GET    | /api/properties        | Listar propiedades (con filtros)|
| GET    | /api/properties/:id    | Obtener propiedad por ID        |
| POST   | /api/properties        | Crear nueva propiedad           |
| PUT    | /api/properties/:id    | Actualizar propiedad            |
| DELETE | /api/properties/:id    | Eliminar propiedad              |

Ver [backend/API_CONTRACT.md](./backend/API_CONTRACT.md) para documentacion detallada.

---

## Notas sobre Instalacion

> **Sobre --legacy-peer-deps**: Este flag es necesario porque algunas dependencias
> aun no declaran soporte para las versiones mas recientes de TypeScript 5.9,
> Prisma 7, y Vite 7. El flag permite instalar las dependencias ignorando
> conflictos de peer dependencies. Las dependencias funcionan correctamente.

---

## Licencia

Este proyecto es de uso educativo y fue creado como material de aprendizaje.

---

## Creditos

> Este proyecto ha sido generado usando Claude Code y adaptado con fines educativos por Adrian Catalan.
