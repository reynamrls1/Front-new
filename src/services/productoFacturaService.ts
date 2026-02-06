import api from './api';

export interface ProductoFacturaDTO {
    id?: number;
    amount: number;
    price: number;
    productId: number;
    billId: number;
    productName?: string;
}

const productoFacturaService = {
    getAll: async () => {
        const response = await api.get<ProductoFacturaDTO[]>('/api/producto-factura');
        return response.data;
    },

    getOne: async (id: number) => {
        const response = await api.get<ProductoFacturaDTO>(`/api/producto-factura/${id}`);
        return response.data;
    },

    create: async (data: ProductoFacturaDTO) => {
        const response = await api.post<ProductoFacturaDTO>('/api/producto-factura', data);
        return response.data;
    },

    update: async (id: number, data: ProductoFacturaDTO) => {
        const response = await api.put<ProductoFacturaDTO>(`/api/producto-factura/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/api/producto-factura/${id}`);
    },

    // Get all products in a specific factura
    getByFactura: async (billId: number) => {
        const all = await api.get<ProductoFacturaDTO[]>('/api/producto-factura');
        return all.data.filter(pf => pf.billId === billId);
    }
};

export default productoFacturaService;
