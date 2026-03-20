# Contrato de API - Module 3: RealEstate Hub API

Este documento define el contrato de la API REST que reemplaza la lógica de localStorage del Module 2.

---

## Base URL

```
http://localhost:3002/api
```

---

## Endpoints

### GET /api/properties

**Reemplaza:** `localStorage.getItem('properties')` + `filterProperties()`

**Descripción:** Lista todas las propiedades con filtros opcionales.

**Query Parameters:**

| Parámetro     | Tipo   | Descripción                                    |
| ------------- | ------ | ---------------------------------------------- |
| search        | string | Búsqueda por título, descripción, dirección    |
| propertyType  | string | casa, apartamento, terreno, local, oficina     |
| operationType | string | venta, alquiler                                |
| minPrice      | number | Precio mínimo                                  |
| maxPrice      | number | Precio máximo                                  |
| minBedrooms   | number | Número mínimo de habitaciones                  |
| city          | string | Filtro por ciudad (búsqueda parcial)           |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "title": "Apartamento con vista al mar",
      "description": "Espectacular apartamento...",
      "propertyType": "apartamento",
      "operationType": "venta",
      "price": 450000,
      "address": "Paseo Marítimo 123",
      "city": "Valencia",
      "bedrooms": 3,
      "bathrooms": 2,
      "area": 120,
      "amenities": ["piscina", "gimnasio"],
      "images": ["https://..."],
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### GET /api/properties/:id

**Reemplaza:** `getPropertyById(id)`

**Descripción:** Obtiene una propiedad específica.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "title": "...",
    ...
  }
}
```

**Response (404 Not Found):**

```json
{
  "success": false,
  "error": {
    "message": "Propiedad no encontrada",
    "code": "NOT_FOUND"
  }
}
```

---

### POST /api/properties

**Reemplaza:** `localStorage.setItem('properties', ...)` al crear

**Descripción:** Crea una nueva propiedad.

**Request Body:**

```json
{
  "title": "Apartamento nuevo en el centro",
  "description": "Descripción detallada de al menos 50 caracteres...",
  "propertyType": "apartamento",
  "operationType": "venta",
  "price": 250000,
  "address": "Calle Principal 123, 3º B",
  "city": "Madrid",
  "bedrooms": 2,
  "bathrooms": 1,
  "area": 85,
  "amenities": ["ascensor", "aire_acondicionado"],
  "images": ["https://example.com/image.jpg"]
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "title": "Apartamento nuevo en el centro",
    ...
    "createdAt": "2025-01-20T14:30:00.000Z",
    "updatedAt": "2025-01-20T14:30:00.000Z"
  }
}
```

**Response (400 Bad Request):**

```json
{
  "success": false,
  "error": {
    "message": "Datos de entrada inválidos",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "path": ["title"],
        "message": "El título debe tener al menos 10 caracteres"
      }
    ]
  }
}
```

---

### PUT /api/properties/:id

**Reemplaza:** `updateProperty(id, data)`

**Descripción:** Actualiza una propiedad existente.

**Request Body:** Campos parciales de CreatePropertyInput

```json
{
  "price": 260000,
  "description": "Nueva descripción actualizada..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    ...
    "updatedAt": "2025-01-21T10:00:00.000Z"
  }
}
```

---

### DELETE /api/properties/:id

**Reemplaza:** `deleteProperty(id)`

**Descripción:** Elimina una propiedad.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Propiedad eliminada correctamente"
  }
}
```

---

## Tipos de Datos

### PropertyType (enum)

```typescript
type PropertyType = 'casa' | 'apartamento' | 'terreno' | 'local' | 'oficina';
```

### OperationType (enum)

```typescript
type OperationType = 'venta' | 'alquiler';
```

### Amenity (enum)

```typescript
type Amenity =
  | 'piscina'
  | 'jardin'
  | 'garage'
  | 'seguridad'
  | 'gimnasio'
  | 'terraza'
  | 'ascensor'
  | 'aire_acondicionado'
  | 'calefaccion'
  | 'amueblado';
```

---

## Códigos de Error

| Código            | HTTP Status | Descripción                        |
| ----------------- | ----------- | ---------------------------------- |
| NOT_FOUND         | 404         | Recurso no encontrado              |
| VALIDATION_ERROR  | 400         | Datos de entrada inválidos         |
| INTERNAL_ERROR    | 500         | Error interno del servidor         |

---

## Formato de Respuestas

### Éxito

```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
}
```

### Error

```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}
```

---

## Notas de Compatibilidad con Module 2

Los tipos de datos de esta API coinciden exactamente con los definidos en `module2-real-estate/src/types/property.ts`. Esto permite:

1. Reutilizar los mismos tipos en frontend y backend
2. Cambiar de localStorage a API sin modificar componentes
3. Validación consistente con los mismos esquemas Zod
