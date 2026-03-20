// =============================================================================
// CONTROLADOR DE PROPIEDADES - Module 3: RealEstate Hub API
// =============================================================================
// Los controladores contienen la lógica de negocio de los endpoints.
//
// ## Patrón Controller + Repository
// Separamos responsabilidades:
// - Controller: Maneja HTTP (req/res), validación, respuestas
// - Repository: Acceso a datos (Prisma), queries, transformaciones
//
// Esto facilita:
// - Testing (mock del repositorio)
// - Cambiar base de datos sin modificar controladores
// - Mantener controladores enfocados en HTTP
//
// ## Comparación con Android (MVVM)
// Android:
//   Controller ≈ ViewModel (maneja lógica de UI)
//   Repository = Repository (acceso a datos)
//
// Express:
//   Controller (maneja HTTP y lógica de negocio)
//   Repository (abstrae Prisma/base de datos)
// =============================================================================

import type { Request, Response } from 'express';
import { createPropertySchema, updatePropertySchema, type PropertyFilters } from '../types/property.js';
import { propertyRepository } from '../repositories/propertyRepository.js';

// =============================================================================
// GET /api/properties - Listar propiedades con filtros y paginación
// =============================================================================
// Reemplaza: localStorage.getItem('properties')
// =============================================================================

export async function getAllProperties(req: Request, res: Response): Promise<void> {
  try {
    // 1. Extraemos y validamos los parámetros de paginación (con valores por defecto)
    let page = req.query.page ? Number(req.query.page) : 1;
    let limit = req.query.limit ? Number(req.query.limit) : 10;

    // Validación: Rechazar negativos o valores no numéricos
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Los parámetros page y limit deben ser números positivos mayores a 0',
          code: 'VALIDATION_ERROR',
        },
      });
      return;
    }

    // 2. Extraemos filtros de los query params
    const filters: PropertyFilters = {
      search: req.query.search as string | undefined,
      propertyType: req.query.propertyType as PropertyFilters['propertyType'],
      operationType: req.query.operationType as PropertyFilters['operationType'],
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      minBedrooms: req.query.minBedrooms ? Number(req.query.minBedrooms) : undefined,
      city: req.query.city as string | undefined,
    };

    // 3. Obtener los datos paginados y el total desde el repositorio
    // Aquí es probable que tu repositorio necesite una pequeña actualización para
    // aceptar page y limit, y para devolver un objeto con los datos y el total de registros.
    // Vamos a asumir que lo actualizaremos para que devuelva { data, total }
    const { data: properties, total } = await propertyRepository.findAll(filters, page, limit);

    // 4. Calcular el total de páginas
    const totalPages = Math.ceil(total / limit);

    // 5. Estructurar la respuesta con la metadata
    res.json({
      success: true,
      data: properties, // Si la página está fuera de rango, Prisma devolverá un array vacío []
      meta: {
        total: total,
        page: page,
        limit: limit,
        pages: totalPages
      }
    });

  } catch (error) {
    console.error('Error al obtener propiedades:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
      },
    });
  }
}

// =============================================================================
// GET /api/properties/:id - Obtener una propiedad por ID
// =============================================================================

export async function getPropertyById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const property = await propertyRepository.findById(id);

    if (!property) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Propiedad no encontrada',
          code: 'NOT_FOUND',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Error al obtener propiedad:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
      },
    });
  }
}

// =============================================================================
// POST /api/properties - Crear una nueva propiedad
// =============================================================================
// Reemplaza: localStorage.setItem('properties', ...)
// =============================================================================

export async function createProperty(req: Request, res: Response): Promise<void> {
  try {
    // Validamos el body con Zod
    const validationResult = createPropertySchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Datos de entrada inválidos',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.issues,
        },
      });
      return;
    }

    // Delegamos la creación al repositorio
    const property = await propertyRepository.create(validationResult.data);

    res.status(201).json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Error al crear propiedad:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
      },
    });
  }
}

// =============================================================================
// PUT /api/properties/:id - Actualizar una propiedad
// =============================================================================

export async function updateProperty(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Validamos el body
    const validationResult = updatePropertySchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Datos de entrada inválidos',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.issues,
        },
      });
      return;
    }

    // Delegamos la actualización al repositorio
    const property = await propertyRepository.update(id, validationResult.data);

    if (!property) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Propiedad no encontrada',
          code: 'NOT_FOUND',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Error al actualizar propiedad:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
      },
    });
  }
}

// =============================================================================
// DELETE /api/properties/:id - Eliminar una propiedad
// =============================================================================

export async function deleteProperty(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Delegamos la eliminación al repositorio
    const deleted = await propertyRepository.delete(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Propiedad no encontrada',
          code: 'NOT_FOUND',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: { message: 'Propiedad eliminada correctamente' },
    });
  } catch (error) {
    console.error('Error al eliminar propiedad:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
      },
    });
  }
}
