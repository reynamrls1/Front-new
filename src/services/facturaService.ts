import api from './api';

export interface FacturaDTO {
    id?: number;
    total: number;
    date: string; // ISO date string
    personId: number;
    personNombre?: string;
    cantidadProductos?: number;
    estado?: 'Pagada' | 'Pendiente' | 'Vencida'; // Frontend-only for display
    restauranteId?: number;
}

const facturaService = {
    getAll: async (restauranteId: number) => {
        const response = await api.get<FacturaDTO[]>(`/api/facturas?restauranteId=${restauranteId}`);
        return response.data;
    },

    getOne: async (id: number) => {
        const response = await api.get<FacturaDTO>(`/api/facturas/${id}`);
        return response.data;
    },

    create: async (data: FacturaDTO) => {
        const response = await api.post<FacturaDTO>('/api/facturas', data);
        return response.data;
    },

    update: async (id: number, data: FacturaDTO) => {
        const response = await api.put<FacturaDTO>(`/api/facturas/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/api/facturas/${id}`);
    }
};

export default facturaService;
