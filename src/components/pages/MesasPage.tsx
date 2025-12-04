import { useState } from 'react';
import { 
  Armchair, 
  Users, 
  Coffee, 
  CheckCircle2, 
  Clock, 
  Utensils,
  Plus // Importamos el ícono de suma
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input'; // Importamos Input
import { Label } from '../ui/label'; // Importamos Label
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger 
} from '../ui/dialog';

// 1. Definición de la Mesa
interface Mesa {
  id: number;
  name: string;
  capacity: number;
  status: 'disponible' | 'ocupada' | 'reservada';
  currentOrder?: string; 
}

export function MesasPage() {
  // 2. Datos de ejemplo
  const [mesas, setMesas] = useState<Mesa[]>([
    { id: 1, name: 'Mesa 1', capacity: 2, status: 'ocupada', currentOrder: '#ORD-001' },
    { id: 2, name: 'Mesa 2', capacity: 4, status: 'disponible' },
    { id: 3, name: 'Mesa 3', capacity: 4, status: 'disponible' },
    { id: 4, name: 'Mesa 4', capacity: 6, status: 'reservada' },
  ]);

  // Estados para filtros y selección
  const [filter, setFilter] = useState<'todos' | 'disponible' | 'ocupada' | 'reservada'>('todos');
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);

  // Estados para CREAR NUEVA MESA
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newMesaName, setNewMesaName] = useState('');
  const [newMesaCapacity, setNewMesaCapacity] = useState('');

  // Cambiar estado de mesa
  const handleStatusChange = (id: number, newStatus: Mesa['status']) => {
    setMesas(mesas.map(m => 
      m.id === id ? { ...m, status: newStatus, currentOrder: newStatus === 'disponible' ? undefined : m.currentOrder } : m
    ));
    setSelectedMesa(null);
  };

  // Función para AGREGAR MESA
  const handleAddMesa = (e: React.FormEvent) => {
    e.preventDefault();
    const newMesa: Mesa = {
      id: Math.max(...mesas.map(m => m.id), 0) + 1, // Generar ID único
      name: newMesaName || `Mesa ${mesas.length + 1}`,
      capacity: parseInt(newMesaCapacity) || 4,
      status: 'disponible'
    };
    
    setMesas([...mesas, newMesa]);
    
    // Limpiar y cerrar
    setNewMesaName('');
    setNewMesaCapacity('');
    setIsCreateOpen(false);
  };

  // Filtrado
  const filteredMesas = mesas.filter(m => filter === 'todos' ? true : m.status === filter);

  // Colores según estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponible': return 'bg-emerald-500 border-emerald-600 shadow-emerald-200';
      case 'ocupada': return 'bg-rose-500 border-rose-600 shadow-rose-200';
      case 'reservada': return 'bg-amber-500 border-amber-600 shadow-amber-200';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disponible': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">Disponible</Badge>;
      case 'ocupada': return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-0">Ocupada</Badge>;
      case 'reservada': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">Reservada</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-6">
      
      {/* Header y Resumen */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Utensils className="w-8 h-8 text-blue-600" />
            Gestión de Mesas
          </h1>
          <p className="text-gray-500 mt-1">
            {mesas.filter(m => m.status === 'disponible').length} mesas libres de {mesas.length} total.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          {/* Filtros */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
            {(['todos', 'disponible', 'ocupada', 'reservada'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                  filter === f 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* BOTÓN NUEVA MESA */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 whitespace-nowrap">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Mesa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white">
              <DialogHeader>
                <DialogTitle>Agregar Nueva Mesa</DialogTitle>
                <DialogDescription>
                  Define el nombre y la capacidad de la nueva ubicación.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddMesa} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Mesa</Label>
                  <Input 
                    id="name" 
                    placeholder="Ej: Terraza 5" 
                    value={newMesaName}
                    onChange={(e) => setNewMesaName(e.target.value)}
                    className="bg-slate-50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidad (Personas)</Label>
                  <Input 
                    id="capacity" 
                    type="number" 
                    placeholder="4" 
                    value={newMesaCapacity}
                    onChange={(e) => setNewMesaCapacity(e.target.value)}
                    className="bg-slate-50"
                    min="1"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Guardar Mesa
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Grid de Mesas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMesas.map((mesa) => (
          <Card 
            key={mesa.id} 
            className="relative overflow-hidden hover:shadow-lg transition-all cursor-pointer group border-0 shadow-md"
            onClick={() => setSelectedMesa(mesa)}
          >
            {/* Barra de color superior */}
            <div className={`h-2 w-full ${getStatusColor(mesa.status).split(' ')[0]}`}></div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${
                  mesa.status === 'disponible' ? 'bg-emerald-50' : 
                  mesa.status === 'ocupada' ? 'bg-rose-50' : 'bg-amber-50'
                }`}>
                  <Armchair className={`w-8 h-8 ${
                    mesa.status === 'disponible' ? 'text-emerald-500' : 
                    mesa.status === 'ocupada' ? 'text-rose-500' : 'text-amber-500'
                  }`} />
                </div>
                {getStatusBadge(mesa.status)}
              </div>

              <h3 className="text-xl font-bold text-gray-900">{mesa.name}</h3>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-500 gap-2">
                  <Users className="w-4 h-4" />
                  <span>Capacidad: {mesa.capacity} personas</span>
                </div>
                {mesa.currentOrder && (
                  <div className="flex items-center text-sm text-gray-500 gap-2">
                    <Coffee className="w-4 h-4" />
                    <span>Orden: <span className="font-semibold text-gray-900">{mesa.currentOrder}</span></span>
                  </div>
                )}
              </div>
            </div>

            {/* Acciones Rápidas (Hover) */}
            <div className="absolute inset-x-0 bottom-0 bg-gray-50 p-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-semibold text-blue-600">Click para gestionar</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal de Detalles de Mesa (Gestión) */}
      <Dialog open={!!selectedMesa} onOpenChange={(open) => !open && setSelectedMesa(null)}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              Gestionar {selectedMesa?.name}
            </DialogTitle>
            <DialogDescription>
              Cambia el estado de la mesa o asigna clientes.
            </DialogDescription>
          </DialogHeader>

          {selectedMesa && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                {selectedMesa.status !== 'disponible' && (
                  <Button 
                    variant="outline"
                    className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 h-24 flex flex-col gap-2"
                    onClick={() => handleStatusChange(selectedMesa.id, 'disponible')}
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <span>Liberar Mesa</span>
                  </Button>
                )}

                {selectedMesa.status !== 'ocupada' && (
                  <Button 
                    variant="outline"
                    className="border-rose-200 hover:bg-rose-50 hover:text-rose-700 h-24 flex flex-col gap-2"
                    onClick={() => handleStatusChange(selectedMesa.id, 'ocupada')}
                  >
                    <Coffee className="w-8 h-8 text-rose-500" />
                    <span>Ocupar Mesa</span>
                  </Button>
                )}

                {selectedMesa.status !== 'reservada' && selectedMesa.status !== 'ocupada' && (
                  <Button 
                    variant="outline"
                    className="border-amber-200 hover:bg-amber-50 hover:text-amber-700 h-24 flex flex-col gap-2 col-span-2"
                    onClick={() => handleStatusChange(selectedMesa.id, 'reservada')}
                  >
                    <Clock className="w-8 h-8 text-amber-500" />
                    <span>Reservar Mesa</span>
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedMesa(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}