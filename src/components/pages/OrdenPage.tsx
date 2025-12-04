import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Orden {
  id: string;
  mesa: number;
  items: number;
  total: number;
  estado: 'Completado' | 'En Proceso' | 'Pendiente';
  hora: string;
}

export function OrdenPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([
    { id: 'ORD-001', mesa: 2, items: 3, total: 45.50, estado: 'En Proceso', hora: '14:30' },
    { id: 'ORD-002', mesa: 5, items: 5, total: 78.99, estado: 'Pendiente', hora: '14:45' },
    { id: 'ORD-003', mesa: 1, items: 2, total: 23.00, estado: 'Completado', hora: '14:15' },
    { id: 'ORD-004', mesa: 3, items: 4, total: 56.75, estado: 'En Proceso', hora: '14:50' },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentOrden, setCurrentOrden] = useState<Orden | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    mesa: 1,
    items: 0,
    total: 0,
    estado: 'Pendiente' as 'Completado' | 'En Proceso' | 'Pendiente',
    hora: '',
  });

  const handleView = (orden: Orden) => {
    setCurrentOrden(orden);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (orden: Orden) => {
    setCurrentOrden(orden);
    setFormData(orden);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar esta orden?')) {
      setOrdenes(ordenes.filter(o => o.id !== id));
    }
  };

  const handleAdd = () => {
    setCurrentOrden(null);
    const now = new Date();
    const hora = now.toTimeString().slice(0, 5);
    const nextId = `ORD-${String(ordenes.length + 1).padStart(3, '0')}`;
    setFormData({
      id: nextId,
      mesa: 1,
      items: 0,
      total: 0,
      estado: 'Pendiente',
      hora,
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentOrden) {
      setOrdenes(ordenes.map(o =>
        o.id === currentOrden.id ? { ...formData } : o
      ));
    } else {
      setOrdenes([...ordenes, formData]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-gray-900">Órdenes</h2>
          <p className="text-gray-600">Gestiona las órdenes activas</p>
        </div>
        <Button onClick={handleAdd} className="relative group/orden">
          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-0 group-hover/orden:opacity-100 transition-opacity duration-500 blur-lg"></span>
          <span className="relative z-10 flex items-center gap-2">
            <Plus className="w-4 h-4 group-hover/orden:rotate-90 transition-transform duration-300" />
            Nueva Orden
          </span>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <TableHead>N° Orden</TableHead>
              <TableHead>Mesa</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordenes.map((orden) => (
              <TableRow key={orden.id} className="hover:bg-blue-50/50 transition-colors">
                <TableCell className="text-gray-900">{orden.id}</TableCell>
                <TableCell>Mesa {orden.mesa}</TableCell>
                <TableCell>{orden.items} items</TableCell>
                <TableCell>${orden.total}</TableCell>
                <TableCell>{orden.hora}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      orden.estado === 'Completado'
                        ? 'bg-green-500'
                        : orden.estado === 'En Proceso'
                        ? 'bg-blue-500'
                        : 'bg-yellow-500'
                    }
                  >
                    {orden.estado}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleView(orden)}
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(orden)}
                      className="hover:bg-amber-50 hover:text-amber-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(orden.id)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isViewMode ? 'Ver' : currentOrden ? 'Editar' : 'Nueva'} Orden
            </DialogTitle>
          </DialogHeader>
          {isViewMode && currentOrden ? (
            <div className="space-y-4">
              <div>
                <Label>N° Orden</Label>
                <p className="text-slate-900 mt-1">{currentOrden.id}</p>
              </div>
              <div>
                <Label>Mesa</Label>
                <p className="text-slate-900 mt-1">Mesa {currentOrden.mesa}</p>
              </div>
              <div>
                <Label>Items</Label>
                <p className="text-slate-900 mt-1">{currentOrden.items} items</p>
              </div>
              <div>
                <Label>Total</Label>
                <p className="text-slate-900 mt-1">${currentOrden.total}</p>
              </div>
              <div>
                <Label>Hora</Label>
                <p className="text-slate-900 mt-1">{currentOrden.hora}</p>
              </div>
              <div>
                <Label>Estado</Label>
                <p className="text-slate-900 mt-1">{currentOrden.estado}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="id">N° Orden *</Label>
                <Input 
                  id="id" 
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  required
                  disabled={!!currentOrden}
                />
              </div>
              <div>
                <Label htmlFor="mesa">Mesa *</Label>
                <Input 
                  id="mesa" 
                  type="number"
                  min="1"
                  value={formData.mesa}
                  onChange={(e) => setFormData({ ...formData, mesa: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="items">Cantidad de Items *</Label>
                <Input 
                  id="items" 
                  type="number"
                  min="0"
                  value={formData.items}
                  onChange={(e) => setFormData({ ...formData, items: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="total">Total *</Label>
                <Input 
                  id="total" 
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="hora">Hora *</Label>
                <Input 
                  id="hora" 
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado *</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value: 'Completado' | 'En Proceso' | 'Pendiente') => 
                    setFormData({ ...formData, estado: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="En Proceso">En Proceso</SelectItem>
                    <SelectItem value="Completado">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {currentOrden ? 'Actualizar' : 'Guardar'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
