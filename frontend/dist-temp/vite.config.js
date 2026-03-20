// =============================================================================
// VITE CONFIGURATION - Module 2: Real Estate React
// =============================================================================
// Configuración de Vite para un proyecto React 19.
//
// ## ¿Por qué Vite para React?
// - HMR (Hot Module Replacement) instantáneo
// - Soporte nativo para JSX y TypeScript
// - Build optimizado con tree-shaking automático
// - Configuración mínima comparada con webpack
// =============================================================================
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    // =========================================================================
    // PLUGINS
    // =========================================================================
    // El plugin de React habilita:
    // - Fast Refresh (actualización de componentes sin perder estado)
    // - Transformación de JSX
    // =========================================================================
    plugins: [react()],
    // =========================================================================
    // RESOLVE - Alias de rutas
    // =========================================================================
    // Configuramos @ como alias para src/ para imports más limpios:
    // import { Button } from '@/components/ui/button'
    // en lugar de:
    // import { Button } from '../../../components/ui/button'
    // =========================================================================
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    // Configuración del servidor de desarrollo
    server: {
        port: 3001,
        open: true,
    },
    // Configuración de build
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
});
