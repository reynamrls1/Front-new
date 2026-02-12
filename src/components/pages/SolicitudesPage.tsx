import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { CheckCircle2, XCircle, Clock, User, Building2 } from 'lucide-react';
import api from '../../services/api';
import authService from '../../services/authService';

interface Solicitud {
    id: number;
    usuarioSolicitanteId: number;
    nombreSolicitante: string;
    restauranteId: number;
    nombreRestaurante: string;
    esParaAdministrador: boolean;
    estado: string; // PENDIENTE, APROBADA, RECHAZADA
    fechaSolicitud: string;
    fechaRespuesta: string | null;
    usuarioAprobadorId: number | null;
}

export function SolicitudesPage() {
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    // Estados de Usuario
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [restauranteId, setRestauranteId] = useState<number | null>(null);

    useEffect(() => {
        // 1. Obtener Info del Usuario desde authService para consistencia con Dashboard
        const { role } = authService.getCurrentUser();
        setUserRole(role);

        // userId
        const storedUserId = localStorage.getItem('user_id');
        if (storedUserId) setUserId(Number(storedUserId));

        // restauranteId
        const storedRestaurantes = localStorage.getItem('user_restaurantes');
        if (storedRestaurantes) {
            try {
                const restaurantes = JSON.parse(storedRestaurantes);
                if (restaurantes.length > 0) {
                    setRestauranteId(restaurantes[0].restauranteId);
                }
            } catch (e) {
                console.error('Error parsing restaurantes', e);
            }
        }
    }, []);

    useEffect(() => {
        if (userRole) {
            fetchSolicitudes();
        }
    }, [userRole, userId, restauranteId]);

    const fetchSolicitudes = async () => {
        setLoading(true);
        try {
            let url = '';

            // LOGICA DE ROLES
            // Usamos la misma lógica que Dashboard: si es admin, ve gestión. Si no, ve sus solicitudes.
            if (userRole === 'admin') {
                if (!restauranteId) {
                    setLoading(false);
                    return;
                }
                // Admin ve todas las de su restaurante
                url = `/api/solicitudes/restaurante/${restauranteId}`;
            } else {
                if (!userId) {
                    setLoading(false);
                    return;
                }
                // Empleado ve SOLO SUS PROPIAS solicitudes
                url = `/api/solicitudes/usuario/${userId}`;
            }

            const response = await api.get(url);
            setSolicitudes(response.data);
        } catch (error) {
            console.error('Error cargando solicitudes', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAprobar = async (solicitudId: number) => {
        if (!userId) return;
        setProcessingId(solicitudId);
        try {
            await api.put(`/api/solicitudes/${solicitudId}/aprobar?usuarioAprobadorId=${userId}`);
            fetchSolicitudes();
        } catch (error) {
            console.error('Error aprobando solicitud', error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleRechazar = async (solicitudId: number) => {
        if (!userId) return;
        setProcessingId(solicitudId);
        try {
            await api.put(`/api/solicitudes/${solicitudId}/rechazar?usuarioAprobadorId=${userId}`);
            fetchSolicitudes();
        } catch (error) {
            console.error('Error rechazando solicitud', error);
        } finally {
            setProcessingId(null);
        }
    };

    const pendientes = solicitudes.filter(s => s.estado === 'PENDIENTE');
    const procesadas = solicitudes.filter(s => s.estado !== 'PENDIENTE');

    // VISTA PARA RESTAURANTE SIN ASOCIAR (Solo Admin)
    if (userRole === 'admin' && !restauranteId) {
        return (
            <div className="p-6 text-center text-slate-500">
                <p className="text-lg font-semibold">No tienes un restaurante asociado</p>
                <p className="text-sm mt-1">Necesitas crear o asociarte a un restaurante primero.</p>
            </div>
        );
    }

    const isEmployeeView = userRole !== 'admin';

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">
                    {isEmployeeView ? 'Mis Solicitudes' : 'Solicitudes de Empleados'}
                </h2>
                <p className="text-sm text-slate-500">
                    {isEmployeeView
                        ? 'Consulta el estado de tus solicitudes de asociación'
                        : 'Gestiona las solicitudes de asociación a tu restaurante'}
                </p>
            </div>

            {loading ? (
                <p className="text-slate-500">Cargando solicitudes...</p>
            ) : (
                <>
                    {/* Solicitudes Pendientes */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-500" />
                            Pendientes ({pendientes.length})
                        </h3>
                        {pendientes.length === 0 ? (
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center text-slate-400">
                                No tienes solicitudes pendientes
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {pendientes.map(sol => (
                                    <div key={sol.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${isEmployeeView ? 'bg-indigo-500' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                                }`}>
                                                {isEmployeeView ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">
                                                    {isEmployeeView ? sol.nombreRestaurante : (sol.nombreSolicitante || `Usuario #${sol.usuarioSolicitanteId}`)}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Enviada el {new Date(sol.fechaSolicitud).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    {sol.esParaAdministrador && !isEmployeeView && ' · Solicita como Admin'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* ACCIONES: Solo Admin puede ver botones */}
                                        {!isEmployeeView ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                                    onClick={() => handleRechazar(sol.id)}
                                                    disabled={processingId === sol.id}
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" /> Rechazar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                    onClick={() => handleAprobar(sol.id)}
                                                    disabled={processingId === sol.id}
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-1" /> Aprobar
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium border border-amber-200">
                                                En espera de aprobación
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Historial */}
                    {procesadas.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-slate-800 mb-3">Historial</h3>
                            <div className="grid gap-2">
                                {procesadas.map(sol => (
                                    <div key={sol.id} className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${sol.estado === 'APROBADA' ? 'bg-emerald-500' : 'bg-red-400'
                                                }`}>
                                                {sol.estado === 'APROBADA' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-slate-700">
                                                    {isEmployeeView ? sol.nombreRestaurante : (sol.nombreSolicitante || `Usuario #${sol.usuarioSolicitanteId}`)}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {sol.estado === 'APROBADA' ? 'Aprobada' : 'Rechazada'} el {sol.fechaRespuesta ? new Date(sol.fechaRespuesta).toLocaleDateString('es-CO') : '-'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${sol.estado === 'APROBADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {sol.estado}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
