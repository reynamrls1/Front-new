import api from './api';

export interface ProductDTO {
    id?: number;
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
    calculatedStock?: number;
    restauranteId?: number;
}

const productoService = {
    getAll: async (restauranteId: number) => {
        const response = await api.get<ProductDTO[]>(`/api/productos?restauranteId=${restauranteId}`);
        return response.data;
    },

    getOne: async (id: number) => {
        const response = await api.get<ProductDTO>(`/api/productos/${id}`);
        return response.data;
    },

    create: async (data: ProductDTO, image?: File) => {
        const formData = new FormData();
        // Append data as a Blob with JSON content type, OR as a string.
        // Backend expects @RequestPart("data") String dataJson, so string is correct.
        formData.append('data', JSON.stringify(data));

        if (image) {
            formData.append('image', image);
        }

        const response = await api.post<ProductDTO>('/api/productos', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    update: async (id: number, data: ProductDTO, image?: File) => {
        const formData = new FormData();
        formData.append('data', JSON.stringify(data));
        if (image) {
            formData.append('image', image);
        }

        const response = await api.put<ProductDTO>(`/api/productos/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/api/productos/${id}`);
    }
};

export default productoService;
