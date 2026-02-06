// src/services/solicitudService.ts
import api from './api';

export interface SolicitudAsociacion {
    id?: number;
    usuarioSolicitanteId?: number;
    nombreSolicitante?: string;
    restauranteId?: number;
    nombreRestaurante?: string;
    esParaAdministrador?: boolean;
    estado?: string; // PENDIENTE, APROBADA, RECHAZADA
    fechaSolicitud?: string;
    fechaRespuesta?: string;
    usuarioAprobadorId?: number;
}

export interface SolicitudRequest {
    usuarioId: number;
    restauranteId: number;
    esParaAdministrador?: boolean;
}

const solicitudService = {
    // Enviar solicitud de asociación
    enviar: async (solicitud: SolicitudRequest) => {
        const response = await api.post('/api/solicitudes', solicitud);
        return response.data;
    },

    // Listar solicitudes pendientes de un restaurante
    listarPendientes: async (restauranteId: number) => {
        const response = await api.get(`/api/solicitudes/restaurante/${restauranteId}/pendientes`);
        return response.data;
    },

    // Listar todas las solicitudes de un restaurante
    listarPorRestaurante: async (restauranteId: number) => {
        const response = await api.get(`/api/solicitudes/restaurante/${restauranteId}`);
        return response.data;
    },

    // Listar solicitudes de un usuario
    listarPorUsuario: async (userId: number) => {
        const response = await api.get(`/api/solicitudes/usuario/${userId}`);
        return response.data;
    },

    // Aprobar solicitud
    aprobar: async (solicitudId: number, usuarioAprobadorId: number) => {
        const response = await api.put(`/api/solicitudes/${solicitudId}/aprobar?usuarioAprobadorId=${usuarioAprobadorId}`);
        return response.data;
    },

    // Rechazar solicitud
    rechazar: async (solicitudId: number, usuarioAprobadorId: number) => {
        const response = await api.put(`/api/solicitudes/${solicitudId}/rechazar?usuarioAprobadorId=${usuarioAprobadorId}`);
        return response.data;
    }
};

export default solicitudService;
