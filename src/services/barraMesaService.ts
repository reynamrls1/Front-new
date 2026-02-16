import api from './api';

export interface BarraMesaDTO {
    id?: number;
    availability: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
    share: number; // Capacidad
    restauranteId?: number;
}

const barraMesaService = {
    getAll: async (restauranteId?: number) => {
        let url = '/api/barra-mesa';
        if (restauranteId) {
            url += `?restauranteId=${restauranteId}`;
        }
        const response = await api.get<BarraMesaDTO[]>(url);
        return response.data;
    },

    getOne: async (id: number) => {
        const response = await api.get<BarraMesaDTO>(`/api/barra-mesa/${id}`);
        return response.data;
    },

    create: async (data: BarraMesaDTO) => {
        const response = await api.post<BarraMesaDTO>('/api/barra-mesa', data);
        return response.data;
    },

    update: async (id: number, data: BarraMesaDTO) => {
        const response = await api.put<BarraMesaDTO>(`/api/barra-mesa/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/api/barra-mesa/${id}`);
    }
};

export default barraMesaService;
