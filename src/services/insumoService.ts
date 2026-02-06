import api from './api';

export interface InsumoDTO {
    id?: number;
    nombre: string;    // Backend: nombre
    marca?: string;
    cantidad?: number; // Backend: cantidad
    categoriaId?: number;
    medida?: string;   // Backend: medida (Enum)
    categoriaNombre?: string;
}

const insumoService = {
    getAll: async () => {
        const response = await api.get<InsumoDTO[]>('/api/insumos');
        return response.data;
    },

    getOne: async (id: number) => {
        const response = await api.get<InsumoDTO>(`/api/insumos/${id}`);
        return response.data;
    },

    create: async (data: InsumoDTO) => {
        const response = await api.post<InsumoDTO>('/api/insumos', data);
        return response.data;
    },

    update: async (id: number, data: InsumoDTO) => {
        const response = await api.put<InsumoDTO>(`/api/insumos/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/api/insumos/${id}`);
    }
};

export default insumoService;
