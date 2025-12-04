import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

interface ProductoFactura {
  id: number;
  factura: string;
  producto: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export function ProductoFacturaPage() {
  const [detalles, setDetalles] = useState<ProductoFactura[]>([
    { id: 1, factura: 'FAC-001', producto: 'Pizza Margherita', cantidad: 2, precio: 15.99, subtotal: 31.98 },
    { id: 2, factura: 'FAC-001', producto: 'Tiramisu', cantidad: 1, precio: 6.99, subtotal: 6.99 },
    { id: 3, factura: 'FAC-002', producto: 'Café Americano', cantidad: 3, precio: 3.50, subtotal: 10.50 },
    { id: 4, factura: 'FAC-002', producto: 'Ensalada César', cantidad: 2, precio: 8.50, subtotal: 17.00 },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentDetalle, setCurrentDetalle] = useState<ProductoFactura | null>(null);
  const [formData, setFormData] = useState({
    factura: '',
    producto: '',
    cantidad: 0,
    precio: 0,
  });

  const handleView = (detalle: ProductoFactura) => {
    setCurrentDetalle(detalle);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (detalle: ProductoFactura) => {
    setCurrentDetalle(detalle);
    setFormData({
      factura: detalle.factura,
      producto: detalle.producto,
      cantidad: detalle.cantidad,
      precio: detalle.precio,
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de eliminar este detalle?')) {
      setDetalles(detalles.filter(d => d.id !== id));
    }
  };

  const handleAdd = () => {
    setCurrentDetalle(null);
    setFormData({
      factura: '',
      producto: '',
      cantidad: 0,
      precio: 0,
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = formData.cantidad * formData.precio;
    if (currentDetalle) {
      setDetalles(detalles.map(d =>
        d.id === currentDetalle.id ? { ...d, ...formData, subtotal } : d
      ));
    } else {
      setDetalles([...detalles, {
        id: Math.max(...detalles.map(d => d.id), 0) + 1,
        ...formData,
        subtotal,
      }]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-gray-900">Producto Factura</h2>
          <p className="text-gray-600">Detalle de productos facturados</p>
        </div>
        <Button onClick={handleAdd} className="relative group/pf">
          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-0 group-hover/pf:opacity-100 transition-opacity duration-500 blur-lg"></span>
          <span className="relative z-10 flex items-center gap-2">
            <Plus className="w-4 h-4 group-hover/pf:rotate-90 transition-transform duration-300" />
            Nuevo Detalle
          </span>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <TableHead>N° Factura</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Precio Unit.</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {detalles.map((detalle) => (
              <TableRow key={detalle.id} className="hover:bg-blue-50/50 transition-colors">
                <TableCell className="text-gray-900">{detalle.factura}</TableCell>
                <TableCell>{detalle.producto}</TableCell>
                <TableCell>{detalle.cantidad}</TableCell>
                <TableCell>${detalle.precio}</TableCell>
                <TableCell>${detalle.subtotal.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleView(detalle)}
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(detalle)}
                      className="hover:bg-amber-50 hover:text-amber-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(detalle.id)}
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
              {isViewMode ? 'Ver' : currentDetalle ? 'Editar' : 'Nuevo'} Detalle de Factura
            </DialogTitle>
          </DialogHeader>
          {isViewMode && currentDetalle ? (
            <div className="space-y-4">
              <div>
                <Label>ID</Label>
                <p className="text-slate-900 mt-1">{currentDetalle.id}</p>
              </div>
              <div>
                <Label>N° Factura</Label>
                <p className="text-slate-900 mt-1">{currentDetalle.factura}</p>
              </div>
              <div>
                <Label>Producto</Label>
                <p className="text-slate-900 mt-1">{currentDetalle.producto}</p>
              </div>
              <div>
                <Label>Cantidad</Label>
                <p className="text-slate-900 mt-1">{currentDetalle.cantidad}</p>
              </div>
              <div>
                <Label>Precio Unitario</Label>
                <p className="text-slate-900 mt-1">${currentDetalle.precio}</p>
              </div>
              <div>
                <Label>Subtotal</Label>
                <p className="text-slate-900 mt-1">${currentDetalle.subtotal.toFixed(2)}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="factura">N° Factura *</Label>
                <Input 
                  id="factura" 
                  placeholder="FAC-001"
                  value={formData.factura}
                  onChange={(e) => setFormData({ ...formData, factura: e.target.value })}
                  required
                />
              </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cantidad">Cantidad *</Label>
                  <Input 
                    id="cantidad" 
                    type="number"
                    min="1"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="precio">Precio *</Label>
                  <Input 
                    id="precio" 
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Subtotal</Label>
                <p className="text-slate-900 mt-1">${(formData.cantidad * formData.precio).toFixed(2)}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {currentDetalle ? 'Actualizar' : 'Guardar'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
