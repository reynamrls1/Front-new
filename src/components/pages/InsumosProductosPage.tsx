import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

interface InsumoProducto {
  id: number;
  producto: string;
  insumo: string;
  cantidad: number;
  unidad: string;
}

export function InsumosProductosPage() {
  const [relaciones, setRelaciones] = useState<InsumoProducto[]>([
    { id: 1, producto: 'Pizza Margherita', insumo: 'Harina', cantidad: 0.3, unidad: 'kg' },
    { id: 2, producto: 'Pizza Margherita', insumo: 'Queso', cantidad: 0.2, unidad: 'kg' },
    { id: 3, producto: 'Café Americano', insumo: 'Café', cantidad: 0.02, unidad: 'kg' },
    { id: 4, producto: 'Ensalada César', insumo: 'Lechuga', cantidad: 0.15, unidad: 'kg' },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentRelacion, setCurrentRelacion] = useState<InsumoProducto | null>(null);
  const [formData, setFormData] = useState({
    producto: '',
    insumo: '',
    cantidad: 0,
    unidad: '',
  });

  const handleView = (relacion: InsumoProducto) => {
    setCurrentRelacion(relacion);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (relacion: InsumoProducto) => {
    setCurrentRelacion(relacion);
    setFormData({
      producto: relacion.producto,
      insumo: relacion.insumo,
      cantidad: relacion.cantidad,
      unidad: relacion.unidad,
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de eliminar esta relación?')) {
      setRelaciones(relaciones.filter(r => r.id !== id));
    }
  };

  const handleAdd = () => {
    setCurrentRelacion(null);
    setFormData({
      producto: '',
      insumo: '',
      cantidad: 0,
      unidad: 'kg',
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRelacion) {
      setRelaciones(relaciones.map(r =>
        r.id === currentRelacion.id ? { ...r, ...formData } : r
      ));
    } else {
      setRelaciones([...relaciones, {
        id: Math.max(...relaciones.map(r => r.id), 0) + 1,
        ...formData,
      }]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-gray-900">Insumos - Productos</h2>
          <p className="text-gray-600">Relación de insumos requeridos por producto</p>
        </div>
        <Button onClick={handleAdd} className="relative group/rel">
          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-0 group-hover/rel:opacity-100 transition-opacity duration-500 blur-lg"></span>
          <span className="relative z-10 flex items-center gap-2">
            <Plus className="w-4 h-4 group-hover/rel:rotate-90 transition-transform duration-300" />
            Nueva Relación
          </span>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <TableHead>Producto</TableHead>
              <TableHead>Insumo</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {relaciones.map((rel) => (
              <TableRow key={rel.id} className="hover:bg-blue-50/50 transition-colors">
                <TableCell className="text-gray-900">{rel.producto}</TableCell>
                <TableCell>{rel.insumo}</TableCell>
                <TableCell>{rel.cantidad}</TableCell>
                <TableCell>{rel.unidad}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleView(rel)}
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(rel)}
                      className="hover:bg-amber-50 hover:text-amber-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(rel.id)}
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
              {isViewMode ? 'Ver' : currentRelacion ? 'Editar' : 'Nueva'} Relación Insumo-Producto
            </DialogTitle>
          </DialogHeader>
          {isViewMode && currentRelacion ? (
            <div className="space-y-4">
              <div>
                <Label>ID</Label>
                <p className="text-slate-900 mt-1">{currentRelacion.id}</p>
              </div>
              <div>
                <Label>Producto</Label>
                <p className="text-slate-900 mt-1">{currentRelacion.producto}</p>
              </div>
              <div>
                <Label>Insumo</Label>
                <p className="text-slate-900 mt-1">{currentRelacion.insumo}</p>
              </div>
              <div>
                <Label>Cantidad</Label>
                <p className="text-slate-900 mt-1">{currentRelacion.cantidad} {currentRelacion.unidad}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="producto">Producto *</Label>
                <Input 
                  id="producto" 
                  placeholder="Nombre del producto"
                  value={formData.producto}
                  onChange={(e) => setFormData({ ...formData, producto: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="insumo">Insumo *</Label>
                <Input 
                  id="insumo" 
                  placeholder="Nombre del insumo"
                  value={formData.insumo}
                  onChange={(e) => setFormData({ ...formData, insumo: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cantidad">Cantidad *</Label>
                  <Input 
                    id="cantidad" 
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unidad">Unidad *</Label>
                  <Input 
                    id="unidad" 
                    placeholder="kg, L, ud"
                    value={formData.unidad}
                    onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {currentRelacion ? 'Actualizar' : 'Guardar'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
