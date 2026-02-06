import api from './api';

export interface ProductDTO {
    id?: number;
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
    calculatedStock?: number;  // Auto-calculated from insumo availability
}

const productoService = {
    getAll: async () => {
        const response = await api.get<ProductDTO[]>('/api/productos');
        return response.data;
    },

    getOne: async (id: number) => {
        const response = await api.get<ProductDTO>(`/api/productos/${id}`);
        return response.data;
    },

    create: async (data: ProductDTO) => {
        const response = await api.post<ProductDTO>('/api/productos', data);
        return response.data;
    },

    update: async (id: number, data: ProductDTO) => {
        const response = await api.put<ProductDTO>(`/api/productos/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/api/productos/${id}`);
    }
};

export default productoService;
