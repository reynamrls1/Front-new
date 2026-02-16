import api from './api';

export interface InsumoDTO {
    id?: number;
    nombre: string;    // Backend: nombre
    marca?: string;
    cantidad?: number; // Backend: cantidad
    categoria?: string; // Backend: CategoriaEnum (ALIMENTOS, BEBIDAS, LIMPIEZA, OTROS)
    medida?: string;   // Backend: medida (Enum)
    restauranteId?: number;
}

const insumoService = {
    getAll: async (restauranteId: number) => {
        const response = await api.get<InsumoDTO[]>(`/api/insumos?restauranteId=${restauranteId}`);
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
