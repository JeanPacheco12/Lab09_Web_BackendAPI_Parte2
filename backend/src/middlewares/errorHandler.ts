// =============================================================================
// MIDDLEWARE DE ERRORES - Module 3: RealEstate Hub API
// =============================================================================
// Middleware centralizado para manejar errores en toda la aplicación.
//
// ## ¿Por qué un middleware de errores?
// - Consistencia: Todos los errores tienen el mismo formato
// - Logging: Un solo lugar para registrar errores
// - Seguridad: No exponemos detalles internos al cliente
// =============================================================================

import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

/**
 * Interface para errores personalizados con código de estado.
 */
interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Middleware de manejo de errores.
 *
 * ## ¿Cómo funciona?
 * Express detecta middlewares de error por tener 4 parámetros.
 * Este middleware captura cualquier error no manejado.
 *
 * @param err - Error capturado
 * @param req - Request de Express
 * @param res - Response de Express
 * @param _next - Función next (no se usa pero es requerida)
 */
export const errorHandler: ErrorRequestHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log del error (en producción usaríamos un servicio de logging)
  console.error('Error no manejado:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
  });

  // Determinamos el código de estado
  const statusCode = err.statusCode ?? 500;

  // Enviamos respuesta consistente
  res.status(statusCode).json({
    success: false,
    error: {
      message: statusCode === 500 ? 'Error interno del servidor' : err.message,
      code: err.code ?? 'INTERNAL_ERROR',
    },
  });
};

/**
 * Middleware para rutas no encontradas.
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Recurso no encontrado',
      code: 'NOT_FOUND',
    },
  });
};
