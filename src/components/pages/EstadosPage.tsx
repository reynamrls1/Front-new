import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { CircleDot, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Estado {
  id: number;
  nombre: string;
  color: string;
  count: number;
}

export function EstadosPage() {
  const [estados, setEstados] = useState<Estado[]>([
    { id: 1, nombre: 'Pendiente', color: 'bg-yellow-500', count: 12 },
    { id: 2, nombre: 'En Proceso', color: 'bg-blue-500', count: 8 },
    { id: 3, nombre: 'Completado', color: 'bg-green-500', count: 45 },
    { id: 4, nombre: 'Cancelado', color: 'bg-red-500', count: 3 },
    { id: 5, nombre: 'En Espera', color: 'bg-orange-500', count: 5 },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentEstado, setCurrentEstado] = useState<Estado | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    color: 'bg-blue-500',
    count: 0,
  });

  const colorOptions = [
    { value: 'bg-blue-500', label: 'Azul' },
    { value: 'bg-green-500', label: 'Verde' },
    { value: 'bg-yellow-500', label: 'Amarillo' },
    { value: 'bg-red-500', label: 'Rojo' },
    { value: 'bg-orange-500', label: 'Naranja' },
    { value: 'bg-purple-500', label: 'Morado' },
    { value: 'bg-pink-500', label: 'Rosa' },
    { value: 'bg-indigo-500', label: 'Índigo' },
    { value: 'bg-gray-500', label: 'Gris' },
  ];

  const handleView = (estado: Estado) => {
    setCurrentEstado(estado);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (estado: Estado) => {
    setCurrentEstado(estado);
    setFormData({
      nombre: estado.nombre,
      color: estado.color,
      count: estado.count,
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de eliminar este estado?')) {
      setEstados(estados.filter(e => e.id !== id));
    }
  };

  const handleAdd = () => {
    setCurrentEstado(null);
    setFormData({
      nombre: '',
      color: 'bg-blue-500',
      count: 0,
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentEstado) {
      setEstados(estados.map(e =>
        e.id === currentEstado.id ? { ...e, ...formData } : e
      ));
    } else {
      setEstados([...estados, {
        id: Math.max(...estados.map(e => e.id), 0) + 1,
        ...formData,
      }]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-gray-900">Estados</h2>
          <p className="text-gray-600">Gestiona los estados de órdenes y productos</p>
        </div>
        <Button onClick={handleAdd} className="relative group/estado">
          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-0 group-hover/estado:opacity-100 transition-opacity duration-500 blur-lg"></span>
          <span className="relative z-10 flex items-center gap-2">
            <Plus className="w-4 h-4 group-hover/estado:rotate-90 transition-transform duration-300" />
            Nuevo Estado
          </span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {estados.map((estado) => (
          <Card key={estado.id} className="p-6 hover:shadow-lg transition-shadow relative group">
            <div className="flex items-center gap-4">
              <div className={`${estado.color} p-3 rounded-lg`}>
                <CircleDot className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900">{estado.nombre}</h3>
                <p className="text-gray-600">{estado.count} registros</p>
              </div>
            </div>
            
            {/* Acciones que aparecen al hacer hover */}
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleView(estado)}
                className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleEdit(estado)}
                className="h-8 w-8 hover:bg-amber-50 hover:text-amber-600"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleDelete(estado.id)}
                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isViewMode ? 'Ver' : currentEstado ? 'Editar' : 'Nuevo'} Estado
            </DialogTitle>
          </DialogHeader>
          {isViewMode && currentEstado ? (
            <div className="space-y-4">
              <div>
                <Label>ID</Label>
                <p className="text-slate-900 mt-1">{currentEstado.id}</p>
              </div>
              <div>
                <Label>Nombre</Label>
                <p className="text-slate-900 mt-1">{currentEstado.nombre}</p>
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`${currentEstado.color} w-8 h-8 rounded-lg`}></div>
                  <p className="text-slate-900">{colorOptions.find(c => c.value === currentEstado.color)?.label}</p>
                </div>
              </div>
              <div>
                <Label>Registros Asociados</Label>
                <p className="text-slate-900 mt-1">{currentEstado.count}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input 
                  id="nombre" 
                  placeholder="Ej: En Proceso"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="color">Color *</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData({ ...formData, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <div className={`${formData.color} w-5 h-5 rounded`}></div>
                        {colorOptions.find(c => c.value === formData.color)?.label}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`${option.value} w-5 h-5 rounded`}></div>
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="count">Registros</Label>
                <Input 
                  id="count" 
                  type="number"
                  min="0"
                  value={formData.count}
                  onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {currentEstado ? 'Actualizar' : 'Guardar'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
