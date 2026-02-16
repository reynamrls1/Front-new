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
  Check,
  MapPin,
  Phone
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
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
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import reservationService, { ReservationDTO } from '../../services/reservationService';
import authService from '../../services/authService';
import restauranteService, { RestauranteDTO } from '../../services/restauranteService';
import barraMesaService, { BarraMesaDTO } from '../../services/barraMesaService';
import { toast } from 'sonner';

export function ReservacionPage() {
  const [activeTab, setActiveTab] = useState<'mis-reservas' | 'explorar'>('explorar');
  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<{ personId: string | null } | null>(null);

  // EXPLORAR
  const [restaurantes, setRestaurantes] = useState<RestauranteDTO[]>([]);
  const [loadingRestaurantes, setLoadingRestaurantes] = useState(false);

  // RESERVAR
  const [isReserveDialogOpen, setIsReserveDialogOpen] = useState(false);
  const [selectedRestaurante, setSelectedRestaurante] = useState<RestauranteDTO | null>(null);
  const [availableMesas, setAvailableMesas] = useState<BarraMesaDTO[]>([]);
  const [loadingMesas, setLoadingMesas] = useState(false);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    people: '2',
    barTableId: '',
    note: ''
  });

  // EDITAR (Mis Reservas)
  const [isEditing, setIsEditing] = useState(false);
  const [currentReservationId, setCurrentReservationId] = useState<number | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user.personId) setCurrentUser({ personId: user.personId });

    const storedRole = localStorage.getItem('user_role');
    console.log("=== FRONTEND DEBUG ===");
    console.log("Rol del usuario:", storedRole);

    // Si es admin o empleado, cargar reservas del restaurante activo
    if (storedRole === 'admin' || storedRole === 'employee') {
      console.log("Usuario es admin o employee, buscando restaurante...");
      const storedRestaurante = localStorage.getItem('restaurante');
      console.log("Restaurante en localStorage:", storedRestaurante);

      if (storedRestaurante) {
        try {
          const parsed = JSON.parse(storedRestaurante);
          console.log("Restaurante parseado:", parsed);

          // Try different possible field names (same as MesasPage)
          const restauranteId = parsed.id || parsed.restauranteId || parsed.idRestaurante;

          if (restauranteId) {
            console.log("Llamando loadRestaurantReservations con ID:", restauranteId);
            loadRestaurantReservations(restauranteId);
          } else {
            console.warn("El restaurante no tiene ID!");
          }
        } catch (e) {
          console.error("Error parseando restaurante:", e);
        }
      } else {
        console.warn("No hay restaurante en localStorage!");
      }
    } else {
      console.log("Usuario es cliente, activeTab:", activeTab);
      // Cliente
      if (activeTab === 'mis-reservas') {
        loadReservations(user.personId);
      } else {
        loadRestaurantes();
      }
    }
  }, [activeTab]);

  const loadRestaurantReservations = async (restauranteId: number) => {
    setLoading(true);
    try {
      const data = await reservationService.getReservationsByRestaurante(restauranteId);
      const sorted = data.sort((a: any, b: any) => new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime());
      setReservations(sorted);
    } catch (e) {
      console.error(e);
      toast.error("Error cargando reservas del restaurante");
    } finally {
      setLoading(false);
    }
  }

  const loadReservations = async (personId: string | null) => {
    if (!personId) return;
    setLoading(true);
    try {
      const data = await reservationService.getReservationsByPerson(parseInt(personId));
      const sorted = data.sort((a: any, b: any) => new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime());
      setReservations(sorted);
    } catch (error) {
      console.error("Error loading reservations", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRestaurantes = async () => {
    setLoadingRestaurantes(true);
    try {
      const data = await restauranteService.getAll();
      setRestaurantes(data.filter(r => r.activo));
    } catch (e) {
      console.error("Error cargando restaurantes", e);
    } finally {
      setLoadingRestaurantes(false);
    }
  }

  // AL ABRIR DIALOGO DE RESERVA
  const handleOpenReserve = async (restaurante: RestauranteDTO) => {
    setSelectedRestaurante(restaurante);
    setFormData({ date: '', time: '', people: '2', barTableId: '', note: '' });
    setIsReserveDialogOpen(true);
    setIsEditing(false);

    // Cargar mesas de este restaurante
    setLoadingMesas(true);
    try {
      const mesas = await barraMesaService.getAll(restaurante.id);
      // Filtrar solo las disponibles (aunque idealmente el backend deberia filtrar por disponibilidad en fecha, por ahora filtramos por estado actual)
      // setAvailableMesas(mesas.filter(m => m.availability === 'AVAILABLE')); 
      // UPDATE: Mostramos todas para que vea el numero, pero deshabilitamos si no está available? 
      // Mejor mostrar solo AVAILABLE para simplificar UX
      setAvailableMesas(mesas.filter(m => m.availability === 'AVAILABLE'));
    } catch (e) {
      console.error(e);
      toast.error("Error cargando mesas");
    } finally {
      setLoadingMesas(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.personId) {
      toast.error("Debes iniciar sesión");
      return;
    }

    try {
      const localDate = new Date(`${formData.date}T${formData.time}`);
      const isoDate = localDate.toISOString();

      const payload: ReservationDTO = {
        id: isEditing && currentReservationId ? currentReservationId : undefined,
        personId: parseInt(currentUser.personId),
        barTableId: parseInt(formData.barTableId),
        reservationDate: isoDate,
        attendat: parseInt(formData.people),
        condition: isEditing ? undefined : 'PENDING',
        aplicationDate: new Date().toISOString().split('T')[0]
      };

      let success = false;
      if (isEditing && currentReservationId) {
        // Mantener condicion
        const currentRes = reservations.find(r => r.id === currentReservationId);
        if (currentRes) payload.condition = currentRes.condition;

        success = await reservationService.updateReservation(currentReservationId, payload);
        if (success) toast.success("Reserva actualizada");
      } else {
        success = await reservationService.createReservation(payload);
        if (success) toast.success("Solicitud de reserva enviada");
      }

      if (success) {
        setIsReserveDialogOpen(false);
        if (activeTab === 'mis-reservas') loadReservations(currentUser.personId);
      } else {
        toast.error("Error al procesar reserva");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al procesar solicitud");
    }
  };

  // EDITAR DESDE MIS RESERVAS
  const handleEdit = async (res: ReservationDTO) => {
    if (!res.id) return;
    // Para editar, necesitamos saber el restaurante original para cargar sus mesas.
    // DTO actual de reserva NO trae restauranteId, solo barTableId.
    // Tendriamos que hacer fetch de la mesa para saber el restaurante. 
    // Por simplicidad en este MVP, al editar solo permitiremos cambiar Fecha/Hora/Personas, NO la mesa (o mostrar input mesa ID manual).
    // O mostramos advertencia.

    // Vamos a permitir editar basicos.
    setIsEditing(true);
    setCurrentReservationId(res.id);

    try {
      const dateObj = new Date(res.reservationDate);
      const dateStr = dateObj.toLocaleDateString('en-CA');
      const timeStr = dateObj.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });

      setFormData({
        date: dateStr,
        time: timeStr,
        people: res.attendat?.toString() || '2',
        barTableId: res.barTableId?.toString() || '',
        note: ''
      });

      // No cargamos mesas disponibles porque no sabemos el restaurante facilmente sin backend support
      // Dejaremos el input de Mesa como ReadOnly o Manual
      setAvailableMesas([]);
      setSelectedRestaurante(null);

      setIsReserveDialogOpen(true);
    } catch (e) { console.error(e); }
  }


  // CONFIRMAR (Admin/Empleado)
  const handleConfirm = async (id: number) => {
    try {
      // Usamos update con condition CONFIRMED
      // Necesitamos el objeto completo o solo enviar lo que cambio? 
      // El backend espera DTO completo en update... eso es un problema del backend actual.
      // PERO, el endpoint update hace:
      // if (dto.getCondition() != null) entity.setCondition(dto.getCondition());
      // Asi que si mandamos solo ID y condition, podria funcionar si el DTO lo permite (campos nulos).
      // Revisando ReservacionServiceImpl:
      // if (dto.getAplicationDate() != null) ...
      // Si mandamos nulls en el resto, NO los actualiza a null, solo actualiza si NO son null.
      // EXCEPTO relaciones... 
      // if (dto.getPersonId() != null) ...
      // Parece seguro mandar partial DTO para updates de campos simples.

      await reservationService.updateReservation(id, { id, condition: 'CONFIRMED' } as any);
      toast.success("Reserva confirmada");

      // Recargar
      const storedRestaurante = localStorage.getItem('restaurante');
      if (storedRestaurante) {
        const parsed = JSON.parse(storedRestaurante);
        if (parsed.id) loadRestaurantReservations(parsed.id);
      }
    } catch (e) {
      console.error(e);
      toast.error("Error al confirmar");
    }
  }

  // CANCELAR
  const handleCancel = async (id: number) => {
    if (!confirm("¿Cancelar reserva?")) return;
    try {
      const success = await reservationService.cancelReservation(id);
      if (success) {
        toast.success("Reserva cancelada");
        // Recargar segun contexto
        const storedRole = localStorage.getItem('user_role');
        if (storedRole === 'admin' || storedRole === 'employee') {
          const storedRestaurante = localStorage.getItem('restaurante');
          if (storedRestaurante) {
            const parsed = JSON.parse(storedRestaurante);
            if (parsed.id) loadRestaurantReservations(parsed.id);
          }
        } else {
          loadReservations(currentUser?.personId || null);
        }
      }
    } catch (e) { console.error(e); }
  };

  const role = localStorage.getItem('user_role');
  const isStaff = role === 'admin' || role === 'employee';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-6 max-w-7xl mx-auto">
      {/* HEADER DIFERENCIADO */}
      {(localStorage.getItem('user_role') === 'admin' || localStorage.getItem('user_role') === 'employee') ? (
        <>
          <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reservas del Restaurante</h1>
              <p className="text-gray-500">Gestiona las reservas entrantes.</p>
            </div>
          </header>

          <Card className="overflow-hidden bg-white border border-gray-200">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Mesa</TableHead>
                  <TableHead>Personas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Cargando...</TableCell></TableRow>
                ) : reservations.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No hay reservas registradas.</TableCell></TableRow>
                ) : (
                  reservations.map(res => (
                    <TableRow key={res.id}>
                      <TableCell className="font-medium">
                        {new Date(res.reservationDate).toLocaleDateString()} <span className="text-gray-400">|</span> {new Date(res.reservationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>#{res.barTableId}</TableCell>
                      <TableCell>{res.attendat}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          res.condition === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-200' :
                            res.condition === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-orange-50 text-orange-700 border-orange-200'
                        }>
                          {res.condition}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {res.condition === 'PENDING' && (
                            <Button variant="ghost" size="sm" onClick={() => res.id && handleConfirm(res.id)} title="Confirmar">
                              <Check className="w-4 h-4 text-green-500" />
                            </Button>
                          )}
                          {res.condition !== 'CANCELLED' && (
                            <Button variant="ghost" size="sm" onClick={() => res.id && handleCancel(res.id)} title="Cancelar">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </>
      ) : (
        <>
          <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reservaciones</h1>
              <p className="text-gray-500">Encuentra tu lugar ideal y reserva mesa.</p>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('explorar')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'explorar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                Explorar Restaurantes
              </button>
              <button
                onClick={() => setActiveTab('mis-reservas')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'mis-reservas' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                Mis Reservas
              </button>
            </div>
          </header>

          {activeTab === 'explorar' && (
            <div className="space-y-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar restaurante..."
                  className="pl-10 bg-white"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              {loadingRestaurantes ? (
                <div className="text-center py-12">Cargando restaurantes...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {restaurantes
                    .filter(r => r.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(restaurante => (
                      <Card key={restaurante.id} className="overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-md flex flex-col">
                        <div className="h-40 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <Utensils className="w-16 h-16 text-white/50" />
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{restaurante.nombre}</h3>
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">Abierto</Badge>
                          </div>

                          <div className="space-y-2 mb-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {restaurante.direccion}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {restaurante.contacto}
                            </div>
                          </div>

                          <div className="mt-auto">
                            <Button
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleOpenReserve(restaurante)}
                            >
                              Reservar Mesa
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'mis-reservas' && (
        <Card className="overflow-hidden bg-white border border-gray-200">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Mesa</TableHead>
                <TableHead>Personas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Cargando...</TableCell></TableRow>
              ) : reservations.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Sin reservaciones.</TableCell></TableRow>
              ) : (
                reservations.map(res => (
                  <TableRow key={res.id}>
                    <TableCell className="font-medium">
                      {new Date(res.reservationDate).toLocaleDateString()} <span className="text-gray-400">|</span> {new Date(res.reservationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell>#{res.barTableId}</TableCell>
                    <TableCell>{res.attendat}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        res.condition === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-200' :
                          res.condition === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-orange-50 text-orange-700 border-orange-200'
                      }>
                        {res.condition}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {res.condition !== 'CANCELLED' && (
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(res)}>
                            <Pencil className="w-4 h-4 text-blue-500" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => res.id && handleCancel(res.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* DIALOGO DE RESERVA */}
      <Dialog open={isReserveDialogOpen} onOpenChange={setIsReserveDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Reserva' : `Reservar en ${selectedRestaurante?.nombre}`}</DialogTitle>
            {!isEditing && <DialogDescription>{selectedRestaurante?.direccion}</DialogDescription>}
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={formData.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Hora</Label>
                <Input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} required className="bg-slate-50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Personas</Label>
                <Input type="number" min="1" value={formData.people} onChange={e => setFormData({ ...formData, people: e.target.value })} required className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label>Mesa</Label>
                {isEditing ? (
                  <Input value={formData.barTableId} readOnly className="bg-slate-100" />
                ) : (
                  <Select onValueChange={val => setFormData({ ...formData, barTableId: val })} value={formData.barTableId} required>
                    <SelectTrigger className="bg-slate-50">
                      <SelectValue placeholder="Seleccionar Mesa" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingMesas ? <SelectItem value="loading" disabled>Cargando mesas...</SelectItem> :
                        availableMesas.length === 0 ? <SelectItem value="none" disabled>No hay mesas disponibles</SelectItem> :
                          availableMesas.map(mesa => (
                            <SelectItem key={mesa.id} value={mesa.id?.toString() || ""}>
                              Mesa #{mesa.id} ({mesa.share} pers.)
                            </SelectItem>
                          ))
                      }
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={(!isEditing && !formData.barTableId)}>
              {isEditing ? 'Guardar Cambios' : 'Confirmar Reserva'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}