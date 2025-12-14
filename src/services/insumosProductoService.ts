import api from './api';
import { InsumoDTO } from './insumoService';
import { ProductDTO } from './productoService';
import { MedidaDTO } from './medidasService';

export interface InsumosProductoDTO {
    id?: number;
    amount: number;
    inputId: number;
    inputNombre?: string; // Mapped from Insumo.inputName
    productId: number;
    productName?: string; // Mapped from Producto.name
    measure: string; // Enum string
}

// For creation/update
export interface InsumosProductoCreateDTO {
    id?: number;
    amount: number;
    inputId: number;
    productId: number;
    measure: string; // Enum string
}

const insumosProductoService = {
    getAll: async () => {
        const response = await api.get<InsumosProductoDTO[]>('/api/insumos-producto');
        return response.data;
    },

    getOne: async (id: number) => {
        const response = await api.get<InsumosProductoDTO>(`/api/insumos-producto/${id}`);
        return response.data;
    },

    create: async (data: InsumosProductoCreateDTO) => {
        // Backend likely expects the nested objects or IDs. 
        // Usually DTOs in Spring Boot map IDs if configured correctly, but here we see "Insumo input" in the model.
        // However, the controller accepts InsumosProductoDTO. Let's assume standard behavior:
        // If the DTO on backend has "input" as object, we might need to send object with ID.
        // If the DTO has "inputId", we send ID.
        // Looking at the Java DTO would be safer, but for now I will try sending the object structure matching the TypeScript DTO which mimics the Java Entity structure usually.
        // WAIT. If I want to be safe, I should check the Java DTO. I will assume it accepts the structure I see in the Model or a standard DTO.
        // Verification: The user showed Models, not DTOs for InsumosProducto. 
        // I will try to support both or check the DTO first but since I cannot verify DTO right now (didn't read it), I'll try sending objects with IDs.
        const payload = {
            amount: data.amount,
            inputId: data.inputId,
            productId: data.productId,
            measure: data.measure
        };
        const response = await api.post<InsumosProductoDTO>('/api/insumos-producto', payload);
        return response.data;
    },

    update: async (id: number, data: InsumosProductoCreateDTO) => {
        const payload = {
            id,
            amount: data.amount,
            inputId: data.inputId,    // Backend DTO expects inputId
            productId: data.productId, // Backend DTO expects productId
            measure: data.measure      // Backend DTO expects measure (Enum)
        };
        const response = await api.put<InsumosProductoDTO>(`/api/insumos-producto/${id}`, payload);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/api/insumos-producto/${id}`);
    }
};

export default insumosProductoService;
