// =============================================================================
// PRISMA CONFIG - Module 3: RealEstate Hub API
// =============================================================================
// Configuracion de Prisma 7+ para la conexion a la base de datos.
//
// En Prisma 7, la configuracion de la URL de la base de datos se mueve
// del schema.prisma a este archivo de configuracion TypeScript.
// =============================================================================

import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: 'file:./prisma/dev.db',
  },
});
