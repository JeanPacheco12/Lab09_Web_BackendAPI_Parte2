// =============================================================================
// REPOSITORIO DE PROPIEDADES - Module 3: RealEstate Hub API
// =============================================================================
// El repositorio abstrae el acceso a la base de datos.
//
// ## Patrón Repository
// Separamos la lógica de persistencia del controlador para:
// - Facilitar el testing (mock del repositorio)
// - Cambiar la base de datos sin modificar controladores
// - Centralizar queries y transformaciones
//
// ## Comparación con Android (Room)
// Android:
//   @Dao
//   interface PropertyDao {
//       @Query("SELECT * FROM properties") fun getAll(): Flow<List<Property>>
//       @Insert suspend fun insert(property: Property)
//   }
//
// Express + Prisma:
//   class PropertyRepository {
//       async findAll(filters): Promise<Property[]>
//       async create(data): Promise<Property>
//   }
// =============================================================================

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import type { Property, PropertyFilters, CreatePropertyInput, UpdatePropertyInput } from '../types/property.js';

// =============================================================================
// CLIENTE PRISMA (Singleton con Adapter para Prisma 7)
// =============================================================================
// En Prisma 7, se requiere un driver adapter para conectar a la base de datos.
// Usamos @prisma/adapter-better-sqlite3 para SQLite.
// =============================================================================

const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });

// =============================================================================
// TIPOS INTERNOS
// =============================================================================

interface PrismaProperty {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  operationType: string;
  price: number;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities: string;
  images: string;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// TRANSFORMADORES
// =============================================================================

/**
 * Transforma un registro de Prisma al tipo Property de la API.
 *
 * ## ¿Por qué transformar?
 * Prisma almacena arrays como JSON strings en SQLite.
 * La API debe devolver arrays JavaScript.
 */
function toProperty(dbProperty: PrismaProperty): Property {
  return {
    id: dbProperty.id,
    title: dbProperty.title,
    description: dbProperty.description,
    propertyType: dbProperty.propertyType as Property['propertyType'],
    operationType: dbProperty.operationType as Property['operationType'],
    price: dbProperty.price,
    address: dbProperty.address,
    city: dbProperty.city,
    bedrooms: dbProperty.bedrooms,
    bathrooms: dbProperty.bathrooms,
    area: dbProperty.area,
    amenities: JSON.parse(dbProperty.amenities) as Property['amenities'],
    images: JSON.parse(dbProperty.images) as Property['images'],
    createdAt: dbProperty.createdAt.toISOString(),
    updatedAt: dbProperty.updatedAt.toISOString(),
  };
}

/**
 * Prepara datos para Prisma (arrays a JSON strings).
 */
function toPrismaData(data: CreatePropertyInput | UpdatePropertyInput): Record<string, unknown> {
  const result: Record<string, unknown> = { ...data };

  if ('amenities' in data && data.amenities) {
    result.amenities = JSON.stringify(data.amenities);
  }
  if ('images' in data && data.images) {
    result.images = JSON.stringify(data.images);
  }

  return result;
}

// =============================================================================
// REPOSITORIO
// =============================================================================

/**
 * Repositorio de propiedades.
 *
 * Centraliza todas las operaciones de base de datos relacionadas con propiedades.
 * El controlador solo llama métodos del repositorio, no interactúa con Prisma directamente.
 */
export const propertyRepository = {
  /**
   * Busca todas las propiedades con filtros opcionales y paginación.
   */
  async findAll(filters: PropertyFilters = {}, page: number = 1, limit: number = 10) {
    // 1. Calculamos el salto (skip)
    const skip = (page - 1) * limit;
    
    // 2. Construimos el filtro (usando tu helper existente)
    const where = buildWhereClause(filters);

    // 3. Ejecutamos búsqueda y conteo en paralelo
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip: skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.property.count({ where })
    ]);

    // 4. Transformamos los resultados y devolvemos el objeto esperado
    return {
      data: properties.map(toProperty), // Usamos tu transformador original
      total: total
    };
  },

  /**
   * Busca una propiedad por ID.
   */
  async findById(id: string): Promise<Property | null> {
    const property = await prisma.property.findUnique({
      where: { id },
    });

    return property ? toProperty(property) : null;
  },

  /**
   * Crea una nueva propiedad.
   */
  async create(data: CreatePropertyInput): Promise<Property> {
    const prismaData = toPrismaData(data);

    const property = await prisma.property.create({
      data: prismaData as Parameters<typeof prisma.property.create>[0]['data'],
    });

    return toProperty(property);
  },

  /**
   * Actualiza una propiedad existente.
   */
  async update(id: string, data: UpdatePropertyInput): Promise<Property | null> {
    // Verificamos que existe
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return null;

    const prismaData = toPrismaData(data);

    const property = await prisma.property.update({
      where: { id },
      data: prismaData,
    });

    return toProperty(property);
  },

  /**
   * Elimina una propiedad.
   */
  async delete(id: string): Promise<boolean> {
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return false;

    await prisma.property.delete({ where: { id } });
    return true;
  },

  /**
   * Verifica si una propiedad existe.
   */
  async exists(id: string): Promise<boolean> {
    const property = await prisma.property.findUnique({
      where: { id },
      select: { id: true },
    });
    return property !== null;
  },

  /**
   * Obtiene estadísticas agregadas de las propiedades.
   */
  async getStats() {
    // 1. Agregaciones globales (Total, Min, Max)
    const globalStats = await prisma.property.aggregate({
      _count: { id: true },
      _min: { price: true },
      _max: { price: true },
    });

    // 2. Estadísticas por tipo (Conteo y Promedio)
    // Usamos groupBy para segmentar los datos por 'propertyType'
    const typeStats = await prisma.property.groupBy({
      by: ['propertyType'],
      _count: { id: true },
      _avg: { price: true },
    });

    return {
      totalCount: globalStats._count.id || 0,
      priceRange: {
        min: globalStats._min.price || 0,
        max: globalStats._max.price || 0,
      },
      byType: typeStats.map(stat => ({
        type: stat.propertyType,
        count: stat._count.id,
        averagePrice: stat._avg.price || 0
      }))
    };
  }
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Construye la cláusula WHERE de Prisma a partir de los filtros.
 */
function buildWhereClause(filters?: PropertyFilters): Record<string, unknown> {
  if (!filters) return {};

  const where: Record<string, unknown> = {};

  if (filters.propertyType) {
    where.propertyType = filters.propertyType;
  }

  if (filters.operationType) {
    where.operationType = filters.operationType;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      (where.price as Record<string, number>).gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      (where.price as Record<string, number>).lte = filters.maxPrice;
    }
  }

  if (filters.minBedrooms !== undefined) {
    where.bedrooms = { gte: filters.minBedrooms };
  }

  if (filters.city) {
    where.city = { contains: filters.city };
  }

  // Búsqueda por texto en múltiples campos
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { description: { contains: filters.search } },
      { address: { contains: filters.search } },
      { city: { contains: filters.search } },
    ];
  }

  return where;
}

// Export por defecto para compatibilidad
export default propertyRepository;
