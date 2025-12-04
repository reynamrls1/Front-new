import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

interface IngresoInsumo {
  id: number;
  insumo: string;
  cantidad: number;
  unidad: string;
  fecha: string;
  proveedor: string;
}

export function IngresosInsumosPage() {
  const [ingresos, setIngresos] = useState<IngresoInsumo[]>([
    { id: 1, insumo: 'Harina', cantidad: 50, unidad: 'kg', fecha: '2025-11-05', proveedor: 'Distribuidora XYZ' },
    { id: 2, insumo: 'Aceite', cantidad: 20, unidad: 'L', fecha: '2025-11-04', proveedor: 'Comercial ABC' },
    { id: 3, insumo: 'Azúcar', cantidad: 30, unidad: 'kg', fecha: '2025-11-03', proveedor: 'Distribuidora XYZ' },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentIngreso, setCurrentIngreso] = useState<IngresoInsumo | null>(null);
  const [formData, setFormData] = useState({
    insumo: '',
    cantidad: 0,
    unidad: '',
    fecha: '',
    proveedor: '',
  });

  const handleView = (ingreso: IngresoInsumo) => {
    setCurrentIngreso(ingreso);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (ingreso: IngresoInsumo) => {
    setCurrentIngreso(ingreso);
    setFormData({
      insumo: ingreso.insumo,
      cantidad: ingreso.cantidad,
      unidad: ingreso.unidad,
      fecha: ingreso.fecha,
      proveedor: ingreso.proveedor,
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de eliminar este ingreso?')) {
      setIngresos(ingresos.filter(i => i.id !== id));
    }
  };

  const handleAdd = () => {
    setCurrentIngreso(null);
    setFormData({
      insumo: '',
      cantidad: 0,
      unidad: 'kg',
      fecha: new Date().toISOString().split('T')[0],
      proveedor: '',
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentIngreso) {
      setIngresos(ingresos.map(i =>
        i.id === currentIngreso.id ? { ...i, ...formData } : i
      ));
    } else {
      setIngresos([...ingresos, {
        id: Math.max(...ingresos.map(i => i.id), 0) + 1,
        ...formData,
      }]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-gray-900">Ingresos de Insumos</h2>
          <p className="text-gray-600">Registra el ingreso de insumos al inventario</p>
        </div>
        <Button onClick={handleAdd} className="relative group/ingreso">
          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-0 group-hover/ingreso:opacity-100 transition-opacity duration-500 blur-lg"></span>
          <span className="relative z-10 flex items-center gap-2">
            <Plus className="w-4 h-4 group-hover/ingreso:rotate-90 transition-transform duration-300" />
            Registrar Ingreso
          </span>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <TableHead>Insumo</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingresos.map((ingreso) => (
              <TableRow key={ingreso.id} className="hover:bg-blue-50/50 transition-colors">
                <TableCell className="text-gray-900">{ingreso.insumo}</TableCell>
                <TableCell>{ingreso.cantidad}</TableCell>
                <TableCell>{ingreso.unidad}</TableCell>
                <TableCell>{ingreso.fecha}</TableCell>
                <TableCell>{ingreso.proveedor}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleView(ingreso)}
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(ingreso)}
                      className="hover:bg-amber-50 hover:text-amber-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(ingreso.id)}
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
              {isViewMode ? 'Ver' : currentIngreso ? 'Editar' : 'Nuevo'} Ingreso de Insumo
            </DialogTitle>
          </DialogHeader>
          {isViewMode && currentIngreso ? (
            <div className="space-y-4">
              <div>
                <Label>ID</Label>
                <p className="text-slate-900 mt-1">{currentIngreso.id}</p>
              </div>
              <div>
                <Label>Insumo</Label>
                <p className="text-slate-900 mt-1">{currentIngreso.insumo}</p>
              </div>
              <div>
                <Label>Cantidad</Label>
                <p className="text-slate-900 mt-1">{currentIngreso.cantidad} {currentIngreso.unidad}</p>
              </div>
              <div>
                <Label>Fecha</Label>
                <p className="text-slate-900 mt-1">{currentIngreso.fecha}</p>
              </div>
              <div>
                <Label>Proveedor</Label>
                <p className="text-slate-900 mt-1">{currentIngreso.proveedor}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    min="0"
                    step="0.01"
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
              <div>
                <Label htmlFor="fecha">Fecha *</Label>
                <Input 
                  id="fecha" 
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="proveedor">Proveedor *</Label>
                <Input 
                  id="proveedor" 
                  placeholder="Nombre del proveedor"
                  value={formData.proveedor}
                  onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {currentIngreso ? 'Actualizar' : 'Guardar'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
