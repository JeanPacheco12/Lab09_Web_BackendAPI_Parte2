// =============================================================================
// TIPOS DE DATOS - Module 3: RealEstate Hub API
// =============================================================================
// Estos tipos DEBEN coincidir 1:1 con los de Module 2.
// Esto garantiza compatibilidad entre el frontend y el backend.
//
// ## Contrato API
// El frontend espera exactamente esta estructura de datos.
// Si modificamos estos tipos, debemos actualizar ambos módulos.
// =============================================================================

import { z } from 'zod';

// =============================================================================
// CONSTANTES (idénticas a Module 2)
// =============================================================================

export const OPERATION_TYPES = ['venta', 'alquiler'] as const;
export type OperationType = (typeof OPERATION_TYPES)[number];

export const PROPERTY_TYPES = ['casa', 'apartamento', 'terreno', 'local', 'oficina'] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const AMENITIES = [
  'piscina',
  'jardin',
  'garage',
  'seguridad',
  'gimnasio',
  'terraza',
  'ascensor',
  'aire_acondicionado',
  'calefaccion',
  'amueblado',
] as const;
export type Amenity = (typeof AMENITIES)[number];

// =============================================================================
// ESQUEMAS ZOD (idénticos a Module 2)
// =============================================================================

/**
 * Esquema para crear una propiedad.
 * NOTA: Este esquema debe ser idéntico al de Module 2.
 */
export const createPropertySchema = z.object({
  title: z
    .string()
    .min(10, 'El título debe tener al menos 10 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres'),

  description: z
    .string()
    .min(50, 'La descripción debe tener al menos 50 caracteres')
    .max(2000, 'La descripción no puede exceder 2000 caracteres'),

  propertyType: z.enum(PROPERTY_TYPES, {
    error: 'Tipo de propiedad invalido',
  }),

  operationType: z.enum(OPERATION_TYPES, {
    error: 'Tipo de operacion invalido',
  }),

  price: z.number().positive('El precio debe ser mayor a 0').max(100_000_000),

  address: z.string().min(10, 'La dirección debe tener al menos 10 caracteres'),

  city: z.string().min(2, 'La ciudad es requerida'),

  bedrooms: z.number().int().min(0).max(20).default(0),

  bathrooms: z.number().int().min(0).max(20).default(0),

  area: z.number().positive().max(100_000),

  amenities: z.array(z.enum(AMENITIES)).default([]),

  images: z.array(z.string().url()).default([]),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

/**
 * Esquema para actualizar una propiedad (todos los campos opcionales).
 */
export const updatePropertySchema = createPropertySchema.partial();
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;

// =============================================================================
// INTERFACE DE RESPUESTA API
// =============================================================================

/**
 * Propiedad completa como se devuelve desde la API.
 * Incluye id y timestamps generados por el servidor.
 */
export interface Property extends CreatePropertyInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Filtros para buscar propiedades.
 */
export interface PropertyFilters {
  search?: string;
  propertyType?: PropertyType;
  operationType?: OperationType;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  city?: string;
}

// =============================================================================
// TIPOS PARA RESPUESTAS API
// =============================================================================

/**
 * Respuesta exitosa genérica.
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
}

/**
 * Respuesta de error genérica.
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

/**
 * Unión de respuestas posibles.
 */
export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;
