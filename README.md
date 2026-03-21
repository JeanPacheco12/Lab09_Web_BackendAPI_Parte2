# Lab 9 - Backend API (Parte 2: Property Statistics)

Este repositorio contiene la segunda parte del lab de **EstateHub API**. El enfoque principal de esta entrega fue implementar un endpoint analítico robusto utilizando funciones avanzadas de agregación con Prisma ORM.

## Funcionalidades Implementadas

*   **Endpoint de Estadísticas**: Creación de la ruta `GET /api/properties/stats`. Se tuvo especial cuidado en registrar esta ruta antes de los parámetros dinámicos (`/:id`) en Express para evitar conflictos de enrutamiento.
*   **Agregación con Prisma**: 
    *   Uso de `prisma.property.aggregate` para extraer de forma eficiente el conteo total y los precios históricos (`min` y `max`).
    *   Uso de `prisma.property.groupBy` para segmentar el inventario por `propertyType`, calculando automáticamente el conteo y el precio promedio por categoría.
*   **Resiliencia (Manejo de BD vacía)**: El sistema está diseñado para evitar errores de tipo `null`. Si la base de datos no contiene registros, el endpoint devuelve una estructura válida con valores inicializados en cero.
*   **Población de Datos (Seed)**: Se corrigió el script de inicialización (`seed.ts`) con el adaptador correcto de SQLite para permitir la siembra de datos de prueba (`npm run db:seed`).

## Tecnologías Usadas
*   **Node.js & Express** (Framework backend)
*   **Prisma ORM (v7)** con Adapter para `better-sqlite3`
*   **TypeScript** (Tipado estático seguro)

## Enlace para el video de la explicación de la parte 2
[https://youtu.be/A_HSRVS0Zus]
