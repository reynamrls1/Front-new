import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  XCircle 
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

// 1. Definimos la estructura de una Reserva
interface Reservation {
  id: number;
  clientName: string; // En el caso del cliente, sería su propio nombre
  date: string;
  time: string;
  people: number;
  status: 'Confirmada' | 'Pendiente' | 'Cancelada';
  note?: string;
}

export function ReservacionPage() {
  // 2. Datos de ejemplo reales de reservas
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: 1,
      clientName: 'Juan Pérez',
      date: '2025-12-05',
      time: '19:30',
      people: 4,
      status: 'Confirmada',
      note: 'Mesa cerca a la ventana',
    },
    {
      id: 2,
      clientName: 'María Rodríguez',
      date: '2025-12-06',
      time: '21:00',
      people: 2,
      status: 'Pendiente',
      note: 'Aniversario',
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para el formulario de nueva reserva
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    people: '2',
    note: ''
  });

  // Crear nueva reserva
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newReservation: Reservation = {
      id: Math.max(...reservations.map(r => r.id), 0) + 1,
      clientName: 'Usuario Actual', // Aquí iría el nombre del usuario logueado
      date: formData.date,
      time: formData.time,
      people: parseInt(formData.people),
      status: 'Pendiente',
      note: formData.note
    };
    setReservations([...reservations, newReservation]);
    setIsDialogOpen(false);
    setFormData({ date: '', time: '', people: '2', note: '' }); // Limpiar form
  };

  // Cancelar reserva
  const handleCancel = (id: number) => {
    setReservations(reservations.map(r => 
      r.id === id ? { ...r, status: 'Cancelada' } : r
    ));
  };

  // Filtro de búsqueda
  const filteredReservations = reservations.filter(r => 
    r.date.includes(searchTerm) || 
    r.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para el color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmada': return 'text-green-600 bg-green-100 border-green-200';
      case 'Pendiente': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'Cancelada': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100';
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
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Reservación
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Reservar Mesa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input 
                    type="date" 
                    required 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora</Label>
                  <Input 
                    type="time" 
                    required
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    className="bg-slate-50" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Número de Personas</Label>
                <Input 
                  type="number" 
                  min="1" 
                  max="20" 
                  required
                  value={formData.people}
                  onChange={e => setFormData({...formData, people: e.target.value})}
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label>Notas Adicionales (Opcional)</Label>
                <Input 
                  placeholder="Ej: Silla de bebé, Alergias..." 
                  value={formData.note}
                  onChange={e => setFormData({...formData, note: e.target.value})}
                  className="bg-slate-50"
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Confirmar Reserva</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barra de Búsqueda */}
      <Card className="p-4 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Buscar por fecha o estado..." 
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
              <TableHead>Personas</TableHead>
              <TableHead>Nota</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReservations.length === 0 ? (
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
                        <Calendar className="w-3 h-3 text-blue-500" /> {res.date}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500 text-xs">
                        <Clock className="w-3 h-3" /> {res.time}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      {res.people}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500 italic text-sm">
                    {res.note || '-'}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(res.status)}`}>
                      {res.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {res.status !== 'Cancelada' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleCancel(res.id)}
                        title="Cancelar Reserva"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
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