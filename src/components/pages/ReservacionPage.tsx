import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  Utensils,
  Pencil,
  Check
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog';
import { Card } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import reservationService, { ReservationDTO } from '../../services/reservationService';
import authService from '../../services/authService';

interface Reservation extends ReservationDTO {
  // Extending DTO for UI if needed
}

export function ReservacionPage() {
  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<{ personId: string | null } | null>(null);

  // UI State for Editing
  const [isEditing, setIsEditing] = useState(false);
  const [currentReservationId, setCurrentReservationId] = useState<number | null>(null);

  // Estados para el formulario de nueva reserva
  const [formData, setFormData] = useState({
    date: '', // YYYY-MM-DD
    time: '', // HH:mm
    people: '2',
    barTableId: '',
    note: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = authService.getCurrentUser();
      if (user.personId) {
        setCurrentUser({ personId: user.personId });
        const data = await reservationService.getReservationsByPerson(parseInt(user.personId));
        // Ordenar por fecha descendente
        const sorted = data.sort((a: any, b: any) => new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime());
        setReservations(sorted);
      }
    } catch (error) {
      console.error("Error loading reservations", error);
    } finally {
      setLoading(false);
    }
  };

  const openNewReservationDialog = () => {
    setIsEditing(false);
    setCurrentReservationId(null);
    setFormData({ date: '', time: '', people: '2', barTableId: '', note: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (res: ReservationDTO) => {
    if (!res.reservationDate) return;
    try {
      const dateObj = new Date(res.reservationDate);
      // Local date inputs require YYYY-MM-DD and HH:mm
      // Need to handle timezone carefully or just show local time
      // Assuming backend keeps UTC but we show local
      const dateStr = dateObj.toLocaleDateString('en-CA'); // YYYY-MM-DD
      const timeStr = dateObj.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });

      setFormData({
        date: dateStr,
        time: timeStr,
        people: res.attendat?.toString() || '2',
        barTableId: res.barTableId?.toString() || '',
        note: '' // Note is not in DTO yet, ignoring
      });
      setIsEditing(true);
      setCurrentReservationId(res.id || null);
      setIsDialogOpen(true);
    } catch (e) {
      console.error("Error parsing date for edit", e);
    }
  };

  // Crear o Actualizar reserva
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.personId) return;

    try {
      const localDate = new Date(`${formData.date}T${formData.time}`);
      const isoDate = localDate.toISOString();

      const payload: ReservationDTO = {
        id: isEditing && currentReservationId ? currentReservationId : undefined,
        personId: parseInt(currentUser.personId),
        barTableId: parseInt(formData.barTableId),
        reservationDate: isoDate,
        attendat: parseInt(formData.people),
        condition: isEditing ? undefined : 'PENDING', // Don't overwrite condition if editing unless intended
        aplicationDate: new Date().toISOString().split('T')[0]
      };

      let success = false;
      if (isEditing && currentReservationId) {
        // Preserve existing condition or handle logic if needed
        // For now, keep it simple
        const currentRes = reservations.find(r => r.id === currentReservationId);
        if (currentRes) payload.condition = currentRes.condition;

        success = await reservationService.updateReservation(currentReservationId, payload);
      } else {
        success = await reservationService.createReservation(payload);
      }

      if (success) {
        setIsDialogOpen(false);
        setFormData({ date: '', time: '', people: '2', barTableId: '', note: '' });
        loadData();
        // alert(isEditing ? "Reserva actualizada" : "Reserva creada con éxito");
      } else {
        alert("Error al procesar la solicitud");
      }
    } catch (error) {
      console.error(error);
      alert("Error al procesar la solicitud");
    }
  };

  // Aceptar Reserva (Confirmar)
  const handleConfirm = async (id: number) => {
    if (!confirm("¿Confirmar esta reserva?")) return;
    try {
      // Necesitamos enviar todos los datos obligatorios para el PUT,
      // recuperamos la reserva actual
      const res = reservations.find(r => r.id === id);
      if (!res) return;

      const updatedRes = { ...res, condition: 'CONFIRMED' as const };
      const success = await reservationService.updateReservation(id, updatedRes);
      if (success) {
        loadData();
      } else {
        alert("No se pudo confirmar la reserva");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Cancelar reserva
  const handleCancel = async (id: number) => {
    if (!confirm("¿Seguro que deseas cancelar esta reserva?")) return;
    try {
      const success = await reservationService.cancelReservation(id);
      if (success) {
        loadData();
        alert("Reserva cancelada");
      } else {
        alert("No se pudo cancelar");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Filtro de búsqueda
  const filteredReservations = reservations.filter(r =>
    (r.reservationDate && r.reservationDate.includes(searchTerm)) ||
    (r.condition && r.condition.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Función para el color del estado
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'CONFIRMED': return 'text-green-600 bg-green-100 border-green-200';
      case 'PENDING': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'CANCELLED': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Formato fecha amigable
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mis Reservaciones</h1>
          <p className="text-gray-500 mt-1">Gestiona tus próximas visitas al restaurante.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openNewReservationDialog}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Reservación
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Reserva' : 'Reservar Mesa'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha del Evento</Label>
                  <Input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora</Label>
                  <Input
                    type="time"
                    required
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número de Personas</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={formData.people}
                    onChange={e => setFormData({ ...formData, people: e.target.value })}
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>N° Mesa</Label>
                  <Input
                    type="number"
                    required
                    placeholder="ID Mesa"
                    value={formData.barTableId}
                    onChange={e => setFormData({ ...formData, barTableId: e.target.value })}
                    className="bg-slate-50"
                  />
                </div>
              </div>
              {/* Note field removed from logic as it's not in backend yet, keeping simplistic */}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                {isEditing ? 'Guardar Cambios' : 'Confirmar Reserva'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barra de Búsqueda */}
      <Card className="p-4 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por fecha, estado..."
            className="pl-10 border-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Tabla de Reservas */}
      <Card className="overflow-hidden bg-white border border-gray-200">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Fecha y Hora</TableHead>
              <TableHead>Mesa</TableHead>
              <TableHead>Personas</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Cargando reservaciones...</TableCell>
              </TableRow>
            ) : filteredReservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No tienes reservaciones registradas.
                </TableCell>
              </TableRow>
            ) : (
              filteredReservations.map((res) => (
                <TableRow key={res.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">#{res.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-blue-500" /> {formatDate(res.reservationDate)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-gray-400" />
                      #{res.barTableId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      {res.attendat}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(res.condition)}`}>
                      {res.condition}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {
                        // Botón Editar (Solo si no está Cancelada)
                        res.condition !== 'CANCELLED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => openEditDialog(res)}
                            title="Editar Reserva"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        )
                      }
                      {
                        // Botón Aceptar (Confirmar) - Solo si está PENDING
                        res.condition === 'PENDING' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-500 hover:text-green-700 hover:bg-green-50"
                            onClick={() => res.id && handleConfirm(res.id)}
                            title="Aceptar Reserva"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )
                      }
                      {
                        // Botón Cancelar
                        res.condition !== 'CANCELLED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => res.id && handleCancel(res.id)}
                            title="Cancelar Reserva"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )
                      }
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}