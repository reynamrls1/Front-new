import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { CheckCircle2, XCircle, Clock, User, Building2, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import authService from '../../services/authService';
import { toast } from 'sonner';

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
    motivoRechazo: string | null;
    leida: boolean;
}

export function SolicitudesPage() {
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    // Estados de Usuario
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [restauranteId, setRestauranteId] = useState<number | null>(null);

    // Búsqueda de Restaurantes (Para empleados)
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]); // Usar interface Restaurante si existiera, o any por ahora
    const [searching, setSearching] = useState(false);
    const [sendingId, setSendingId] = useState<number | null>(null);

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

    // Verificar rechazos no leídos
    const checkRechazosNoLeidos = async () => {
        if (!userId || userRole === 'admin') return;
        try {
            const response = await api.get(`/api/solicitudes/usuario/${userId}/rechazadas/no-leidas`);
            const rechazadas: Solicitud[] = response.data;
            if (rechazadas.length > 0) {
                rechazadas.forEach(sol => {
                    toast.error(
                        `Tu solicitud a "${sol.nombreRestaurante}" fue rechazada.${sol.motivoRechazo ? ` Motivo: ${sol.motivoRechazo}` : ''}`,
                        { duration: 8000 }
                    );
                });
                // Marcar como leídas
                await api.put(`/api/solicitudes/usuario/${userId}/marcar-leidas`);
            }
        } catch (error) {
            console.error('Error verificando rechazos', error);
        }
    };

    useEffect(() => {
        if (userId && userRole && userRole !== 'admin') {
            checkRechazosNoLeidos();
        }
    }, [userId, userRole]);

    // Buscar Restaurantes
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        setSearching(true);
        try {
            const response = await api.get(`/api/restaurantes/search?q=${encodeURIComponent(searchTerm)}`);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error buscando restaurantes', error);
            toast.error('Error al buscar restaurantes');
        } finally {
            setSearching(false);
        }
    };

    // Enviar Solicitud
    const handleEnviarSolicitud = async (restId: number) => {
        if (!userId) return;
        setSendingId(restId);
        try {
            await api.post('/api/solicitudes', {
                usuarioId: userId,
                restauranteId: restId,
                esParaAdministrador: false // Por defecto como empleado
            });
            toast.success('Solicitud enviada correctamente');
            setSearchResults(prev => prev.filter(r => r.id !== restId)); // Remover de resultados para evitar duplicados visuales
            fetchSolicitudes(); // Recargar lista
        } catch (error: any) {
            console.error('Error enviando solicitud', error);
            toast.error(error.response?.data?.message || 'Error al enviar solicitud');
        } finally {
            setSendingId(null);
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
        const motivo = prompt('¿Motivo del rechazo? (opcional)');
        setProcessingId(solicitudId);
        try {
            let url = `/api/solicitudes/${solicitudId}/rechazar?usuarioAprobadorId=${userId}`;
            if (motivo) {
                url += `&motivoRechazo=${encodeURIComponent(motivo)}`;
            }
            await api.put(url);
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

            {/* SECCIÓN DE BÚSQUEDA (Solo Empleados) */}
            {
                isEmployeeView && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold mb-3">Buscar Restaurante</h3>
                        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="Nombre del restaurante..."
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button type="submit" disabled={searching}>
                                {searching ? 'Buscando...' : 'Buscar'}
                            </Button>
                        </form>

                        {searchResults.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm text-slate-500 mb-2">Resultados:</p>
                                {searchResults.map(rest => (
                                    <div key={rest.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <div>
                                            <p className="font-semibold">{rest.nombre}</p>
                                            <p className="text-xs text-slate-500">{rest.direccion}</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleEnviarSolicitud(rest.id)}
                                            disabled={sendingId === rest.id}
                                        >
                                            {sendingId === rest.id ? 'Enviando...' : 'Enviar Solicitud'}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }

            {
                loading ? (
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
                                                        {sol.estado === 'RECHAZADA' && sol.motivoRechazo && (
                                                            <span className="block text-red-500 mt-1">
                                                                <AlertTriangle className="w-3 h-3 inline mr-1" />
                                                                Motivo: {sol.motivoRechazo}
                                                            </span>
                                                        )}
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
                )
            }
        </div>
    );
}
