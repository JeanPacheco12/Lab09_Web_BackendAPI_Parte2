// =============================================================================
// API CLIENT SERVICE
// =============================================================================
// Wrapper para fetch que maneja la comunicación con el backend (Module 3 API).
// =============================================================================

import {
    type Property,
    type CreatePropertyInput,
    type UpdatePropertyInput,
    type PropertyFilters,
    type ApiResponse,
} from '../types/property';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

/**
 * Error personalizado para peticiones API
 */
export class ApiError extends Error {
    constructor(
        public status: number,
        public message: string,
        public details?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Wrapper genérico para fetch
 */
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    const data = (await response.json()) as ApiResponse<T> | { success: false; error: { message: string } };

    if (!response.ok || !data.success) {
        const message = !data.success ? data.error.message : 'Error desconocido';
        throw new ApiError(response.status, message);
    }

    return data.data;
}

export const propertyService = {
    /**
     * Obtener todas las propiedades con filtros opcionales
     */
    getAll: async (filters?: PropertyFilters): Promise<Property[]> => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    params.append(key, String(value));
                }
            });
        }
        return fetchApi<Property[]>(`/properties?${params.toString()}`);
    },

    /**
     * Obtener una propiedad por ID
     */
    getById: async (id: string): Promise<Property> => {
        return fetchApi<Property>(`/properties/${id}`);
    },

    /**
     * Crear nueva propiedad
     */
    create: async (property: CreatePropertyInput): Promise<Property> => {
        return fetchApi<Property>('/properties', {
            method: 'POST',
            body: JSON.stringify(property),
        });
    },

    /**
     * Actualizar propiedad existente
     */
    update: async (id: string, property: UpdatePropertyInput): Promise<Property> => {
        return fetchApi<Property>(`/properties/${id}`, {
            method: 'PUT',
            body: JSON.stringify(property),
        });
    },

    /**
     * Eliminar propiedad
     */
    delete: async (id: string): Promise<void> => {
        return fetchApi<void>(`/properties/${id}`, {
            method: 'DELETE',
        });
    },
};
