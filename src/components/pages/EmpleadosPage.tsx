import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Search, Users, Trash2, ShieldCheck, UserCog } from 'lucide-react';
import { Button } from '../ui/button';
import api from '../../services/api';
import Swal from 'sweetalert2';

interface EmpleadoRestaurante {
    userId: number;
    restauranteId: number;
    nombreRestaurante: string;
    esAdministrador: boolean;
    fechaAsociacion: string;
    activo: boolean;
    // Datos extra que cargaremos
    nombreCompleto?: string;
    email?: string;
}

export function EmpleadosPage() {
    const [empleados, setEmpleados] = useState<EmpleadoRestaurante[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [restauranteId, setRestauranteId] = useState<number | null>(null);
    const [restauranteNombre, setRestauranteNombre] = useState('');

    useEffect(() => {
        const storedRestaurantes = localStorage.getItem('user_restaurantes');
        if (storedRestaurantes) {
            try {
                const restaurantes = JSON.parse(storedRestaurantes);
                if (restaurantes.length > 0) {
                    setRestauranteId(restaurantes[0].restauranteId);
                    setRestauranteNombre(restaurantes[0].nombreRestaurante || 'Tu Restaurante');
                }
            } catch (e) {
                console.error('Error parsing restaurantes', e);
            }
        }
    }, []);

    useEffect(() => {
        if (restauranteId) {
            fetchEmpleados();
        }
    }, [restauranteId]);

    const fetchEmpleados = async () => {
        if (!restauranteId) return;
        setLoading(true);
        try {
            const response = await api.get(`/api/user-restaurantes/restaurante/${restauranteId}`);
            const data: EmpleadoRestaurante[] = response.data;

            // Para cada empleado, intentar cargar su información completa
            const empleadosConInfo = await Promise.all(
                data.map(async (emp) => {
                    try {
                        // Intentar obtener info del usuario
                        const userResp = await api.get(`/api/users/${emp.userId}`);
                        return {
                            ...emp,
                            nombreCompleto: `${userResp.data.firstName || ''} ${userResp.data.lastName || ''}`.trim(),
                            email: userResp.data.email || userResp.data.login || ''
                        };
                    } catch {
                        return { ...emp, nombreCompleto: `Usuario #${emp.userId}`, email: '-' };
                    }
                })
            );

            setEmpleados(empleadosConInfo);
        } catch (error) {
            console.error('Error cargando empleados', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemover = async (userId: number) => {
        if (!restauranteId) return;

        const result = await Swal.fire({
            title: '¿Está seguro?',
            text: "¿Seguro que deseas remover este empleado del restaurante?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, remover',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/api/user-restaurantes/${userId}/${restauranteId}`);
                setEmpleados(empleados.filter(e => e.userId !== userId));
                Swal.fire('¡Removido!', 'El empleado ha sido removido.', 'success');
            } catch (error) {
                console.error('Error removiendo empleado', error);
                Swal.fire('Error', 'Error al remover empleado', 'error');
            }
        }
    };

    const filteredEmpleados = empleados.filter(e =>
        e.nombreCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(e.userId).includes(searchTerm)
    );

    if (!restauranteId) {
        return (
            <div className="p-6 text-center text-slate-500">
                <p className="text-lg font-semibold">No tienes un restaurante asociado</p>
                <p className="text-sm mt-1">Necesitas crear o asociarte a un restaurante primero.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-600" />
                        Empleados
                    </h2>
                    <p className="text-slate-600">Empleados asociados a <span className="font-semibold">{restauranteNombre}</span></p>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                <TableHead>ID</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead>Fecha Asociación</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">Cargando empleados...</TableCell>
                                </TableRow>
                            ) : filteredEmpleados.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                                        No hay empleados asociados al restaurante.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredEmpleados.map((emp) => (
                                    <TableRow key={emp.userId} className="hover:bg-indigo-50/50 transition-colors">
                                        <TableCell className="font-mono text-sm">{emp.userId}</TableCell>
                                        <TableCell className="font-medium">{emp.nombreCompleto}</TableCell>
                                        <TableCell className="text-slate-600">{emp.email}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${emp.esAdministrador
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {emp.esAdministrador ? (
                                                    <><ShieldCheck className="w-3 h-3" /> Admin</>
                                                ) : (
                                                    <><UserCog className="w-3 h-3" /> Empleado</>
                                                )}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-500">
                                            {emp.fechaAsociacion ? new Date(emp.fechaAsociacion).toLocaleDateString('es-CO') : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemover(emp.userId)}
                                                className="hover:bg-red-50 hover:text-red-600"
                                                title="Remover del restaurante"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
