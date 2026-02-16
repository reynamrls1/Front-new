import { useState, useEffect } from 'react';
import {
  Armchair,
  Users,
  Coffee,
  CheckCircle2,
  Clock,
  Utensils,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import barraMesaService, { BarraMesaDTO } from '../../services/barraMesaService';
import { toast } from 'sonner';

export function MesasPage() {
  const [mesas, setMesas] = useState<BarraMesaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'AVAILABLE' | 'OCCUPIED' | 'RESERVED'>('todos');
  const [selectedMesa, setSelectedMesa] = useState<BarraMesaDTO | null>(null);

  // Estados para CREAR/EDITAR
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<BarraMesaDTO>({
    availability: 'AVAILABLE',
    share: 4
  });

  useEffect(() => {
    loadData();
  }, []);

  const getRestauranteId = () => {
    const storedRestaurante = localStorage.getItem('restaurante');
    console.log("Raw localStorage 'restaurante':", storedRestaurante); // DEBUG

    if (storedRestaurante) {
      try {
        const parsed = JSON.parse(storedRestaurante);
        console.log("Parsed restaurante object:", parsed); // DEBUG

        // Try different possible field names
        const id = parsed.id || parsed.restauranteId || parsed.idRestaurante;
        console.log("Extracted ID:", id); // DEBUG

        return id;
      } catch (e) {
        console.error("Error parsing restaurante from localStorage", e);
        return null;
      }
    }

    console.warn("No restaurante found in localStorage"); // DEBUG
    return null;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const restauranteId = getRestauranteId();
      if (!restauranteId) {
        toast.error("No hay restaurante seleccionado");
        setLoading(false);
        return;
      }
      const data = await barraMesaService.getAll(restauranteId);
      setMesas(data);
    } catch (error) {
      console.error("Error loading tables", error);
      toast.error("Error al cargar mesas");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: BarraMesaDTO['availability']) => {
    try {
      const mesa = mesas.find(m => m.id === id);
      if (!mesa) return;

      const updatedMesa = { ...mesa, availability: newStatus };
      await barraMesaService.update(id, updatedMesa);

      setMesas(mesas.map(m => m.id === id ? updatedMesa : m));
      setSelectedMesa(null); // Close dialog
      toast.success("Estado actualizado");
    } catch (error) {
      console.error("Error updating status", error);
      toast.error("Error al actualizar estado");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await barraMesaService.update(editingId, formData);
        toast.success("Mesa actualizada");
      } else {
        const restauranteId = getRestauranteId();
        console.log("Creating table for restauranteId:", restauranteId); // DEBUG

        if (!restauranteId) {
          toast.error("No hay restaurante seleccionado. Por favor, ve al Dashboard y selecciona un restaurante primero.");
          setIsCreateOpen(false);
          return;
        }

        console.log("Sending to backend:", { ...formData, restauranteId }); // DEBUG
        await barraMesaService.create({ ...formData, restauranteId });
        toast.success("Mesa creada");
      }
      setIsCreateOpen(false);
      setEditingId(null);
      setFormData({ availability: 'AVAILABLE', share: 4 });
      loadData();
    } catch (error: any) {
      console.error("Error saving table:", error);
      const errorMsg = error?.response?.data?.message || error?.message || "Error desconocido";
      toast.error(`Error al guardar mesa: ${errorMsg}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar esta mesa?")) return;
    try {
      await barraMesaService.delete(id);
      setMesas(mesas.filter(m => m.id !== id));
      toast.success("Mesa eliminada");
    } catch (error) {
      console.error("Error deleting table", error);
      toast.error("No se pudo eliminar la mesa (puede tener reservas asociadas)");
    }
  };

  const openEdit = (mesa: BarraMesaDTO) => {
    setEditingId(mesa.id!);
    setFormData({
      availability: mesa.availability,
      share: mesa.share
    });
    setIsCreateOpen(true);
  };

  // Filtrado
  const filteredMesas = mesas.filter(m => filter === 'todos' ? true : m.availability === filter);

  // Colores según estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-500 border-emerald-600 shadow-emerald-200';
      case 'OCCUPIED': return 'bg-rose-500 border-rose-600 shadow-rose-200';
      case 'RESERVED': return 'bg-amber-500 border-amber-600 shadow-amber-200';
      case 'MAINTENANCE': return 'bg-gray-500 border-gray-600 shadow-gray-200';
      default: return 'bg-slate-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">Disponible</Badge>;
      case 'OCCUPIED': return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-0">Ocupada</Badge>;
      case 'RESERVED': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">Reservada</Badge>;
      case 'MAINTENANCE': return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0">Mantenimiento</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
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
            {mesas.filter(m => m.availability === 'AVAILABLE').length} mesas libres de {mesas.length} total.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          {/* Filtros */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
            {(['todos', 'AVAILABLE', 'OCCUPIED', 'RESERVED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${filter === f
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                {f === 'todos' ? 'Todos' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* BOTÓN NUEVA MESA */}
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setEditingId(null);
              setFormData({ availability: 'AVAILABLE', share: 4 });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 whitespace-nowrap">
                <Plus className="w-4 h-4 mr-2" />
                {editingId ? 'Editar Mesa' : 'Nueva Mesa'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Mesa' : 'Agregar Nueva Mesa'}</DialogTitle>
                <DialogDescription>
                  Define la capacidad de la mesa.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidad (Personas)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="4"
                    value={formData.share}
                    onChange={(e) => setFormData({ ...formData, share: parseInt(e.target.value) })}
                    className="bg-slate-50"
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado Inicial</Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(val: any) => setFormData({ ...formData, availability: val })}
                  >
                    <SelectTrigger className="bg-slate-50">
                      <SelectValue placeholder="Seleccione estado" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="AVAILABLE">Disponible</SelectItem>
                      <SelectItem value="OCCUPIED">Ocupada</SelectItem>
                      <SelectItem value="RESERVED">Reservada</SelectItem>
                      <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  {editingId ? 'Actualizar' : 'Guardar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Grid de Mesas */}
      {loading ? (
        <div className="text-center py-10">Cargando mesas...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMesas.map((mesa) => (
            <Card
              key={mesa.id}
              className="relative overflow-hidden hover:shadow-lg transition-all cursor-pointer group border-0 shadow-md"
              onClick={() => setSelectedMesa(mesa)}
            >
              {/* Barra de color superior */}
              <div className={`h-2 w-full ${getStatusColor(mesa.availability).split(' ')[0]}`}></div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${mesa.availability === 'AVAILABLE' ? 'bg-emerald-50' :
                    mesa.availability === 'OCCUPIED' ? 'bg-rose-50' :
                      mesa.availability === 'RESERVED' ? 'bg-amber-50' : 'bg-gray-50'
                    }`}>
                    <Armchair className={`w-8 h-8 ${mesa.availability === 'AVAILABLE' ? 'text-emerald-500' :
                      mesa.availability === 'OCCUPIED' ? 'text-rose-500' :
                        mesa.availability === 'RESERVED' ? 'text-amber-500' : 'text-gray-500'
                      }`} />
                  </div>
                  {getStatusBadge(mesa.availability)}
                </div>

                <h3 className="text-xl font-bold text-gray-900">Mesa #{mesa.id}</h3>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-500 gap-2">
                    <Users className="w-4 h-4" />
                    <span>Capacidad: {mesa.share} personas</span>
                  </div>
                </div>

                {/* Botones de acción rápida */}
                <div className="mt-4 flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(mesa)}>
                    <Edit className="w-4 h-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(mesa.id!)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Detalles de Mesa (Gestión Rápida de Estado) */}
      <Dialog open={!!selectedMesa} onOpenChange={(open) => !open && setSelectedMesa(null)}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              Gestionar Mesa #{selectedMesa?.id}
            </DialogTitle>
            <DialogDescription>
              Cambia el estado de la mesa rápidamente.
            </DialogDescription>
          </DialogHeader>

          {selectedMesa && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                {selectedMesa.availability !== 'AVAILABLE' && (
                  <Button
                    variant="outline"
                    className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 h-24 flex flex-col gap-2"
                    onClick={() => handleStatusChange(selectedMesa.id!, 'AVAILABLE')}
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <span>Liberar Mesa</span>
                  </Button>
                )}

                {selectedMesa.availability !== 'OCCUPIED' && (
                  <Button
                    variant="outline"
                    className="border-rose-200 hover:bg-rose-50 hover:text-rose-700 h-24 flex flex-col gap-2"
                    onClick={() => handleStatusChange(selectedMesa.id!, 'OCCUPIED')}
                  >
                    <Coffee className="w-8 h-8 text-rose-500" />
                    <span>Ocupar Mesa</span>
                  </Button>
                )}

                {selectedMesa.availability !== 'RESERVED' && selectedMesa.availability !== 'OCCUPIED' && (
                  <Button
                    variant="outline"
                    className="border-amber-200 hover:bg-amber-50 hover:text-amber-700 h-24 flex flex-col gap-2 col-span-2"
                    onClick={() => handleStatusChange(selectedMesa.id!, 'RESERVED')}
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