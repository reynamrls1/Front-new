import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Plus, Eye, Download, Edit, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Factura {
  id: string;
  cliente: string;
  fecha: string;
  total: number;
  estado: 'Pagada' | 'Pendiente' | 'Vencida';
}

export function FacturasPage() {
  const [facturas, setFacturas] = useState<Factura[]>([
    { id: 'FAC-001', cliente: 'Juan Pérez', fecha: '2025-11-05', total: 150.50, estado: 'Pagada' },
    { id: 'FAC-002', cliente: 'María García', fecha: '2025-11-05', total: 89.99, estado: 'Pendiente' },
    { id: 'FAC-003', cliente: 'Carlos Ruiz', fecha: '2025-11-04', total: 234.75, estado: 'Pagada' },
    { id: 'FAC-004', cliente: 'Ana López', fecha: '2025-11-04', total: 67.30, estado: 'Vencida' },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentFactura, setCurrentFactura] = useState<Factura | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    cliente: '',
    fecha: '',
    total: 0,
    estado: 'Pendiente' as 'Pagada' | 'Pendiente' | 'Vencida',
  });

  const handleView = (factura: Factura) => {
    setCurrentFactura(factura);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (factura: Factura) => {
    setCurrentFactura(factura);
    setFormData(factura);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar esta factura?')) {
      setFacturas(facturas.filter(f => f.id !== id));
    }
  };

  const handleAdd = () => {
    setCurrentFactura(null);
    const nextId = `FAC-${String(facturas.length + 1).padStart(3, '0')}`;
    setFormData({
      id: nextId,
      cliente: '',
      fecha: new Date().toISOString().split('T')[0],
      total: 0,
      estado: 'Pendiente',
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentFactura) {
      setFacturas(facturas.map(f =>
        f.id === currentFactura.id ? { ...formData } : f
      ));
    } else {
      setFacturas([...facturas, formData]);
    }
    setIsDialogOpen(false);
  };

  const handleDownload = (factura: Factura) => {
    alert(`Descargando factura ${factura.id}...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-gray-900">Facturas</h2>
          <p className="text-gray-600">Gestiona y consulta facturas</p>
        </div>
        <Button onClick={handleAdd} className="relative group/invoice">
          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-0 group-hover/invoice:opacity-100 transition-opacity duration-500 blur-lg"></span>
          <span className="relative z-10 flex items-center gap-2">
            <Plus className="w-4 h-4 group-hover/invoice:rotate-90 transition-transform duration-300" />
            Nueva Factura
          </span>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <TableHead>N° Factura</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {facturas.map((factura) => (
              <TableRow key={factura.id} className="hover:bg-blue-50/50 transition-colors">
                <TableCell className="text-gray-900">{factura.id}</TableCell>
                <TableCell>{factura.cliente}</TableCell>
                <TableCell>{factura.fecha}</TableCell>
                <TableCell>${factura.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      factura.estado === 'Pagada'
                        ? 'bg-green-500'
                        : factura.estado === 'Pendiente'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }
                  >
                    {factura.estado}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleView(factura)}
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(factura)}
                      className="hover:bg-amber-50 hover:text-amber-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDownload(factura)}
                      className="hover:bg-green-50 hover:text-green-600"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(factura.id)}
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
              {isViewMode ? 'Ver' : currentFactura ? 'Editar' : 'Nueva'} Factura
            </DialogTitle>
          </DialogHeader>
          {isViewMode && currentFactura ? (
            <div className="space-y-4">
              <div>
                <Label>N° Factura</Label>
                <p className="text-slate-900 mt-1">{currentFactura.id}</p>
              </div>
              <div>
                <Label>Cliente</Label>
                <p className="text-slate-900 mt-1">{currentFactura.cliente}</p>
              </div>
              <div>
                <Label>Fecha</Label>
                <p className="text-slate-900 mt-1">{currentFactura.fecha}</p>
              </div>
              <div>
                <Label>Total</Label>
                <p className="text-slate-900 mt-1">${currentFactura.total.toFixed(2)}</p>
              </div>
              <div>
                <Label>Estado</Label>
                <p className="text-slate-900 mt-1">{currentFactura.estado}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="id">N° Factura *</Label>
                <Input 
                  id="id" 
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  required
                  disabled={!!currentFactura}
                />
              </div>
              <div>
                <Label htmlFor="cliente">Cliente *</Label>
                <Input 
                  id="cliente" 
                  placeholder="Nombre del cliente"
                  value={formData.cliente}
                  onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                  required
                />
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
                <Label htmlFor="total">Total *</Label>
                <Input 
                  id="total" 
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado *</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value: 'Pagada' | 'Pendiente' | 'Vencida') => 
                    setFormData({ ...formData, estado: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Pagada">Pagada</SelectItem>
                    <SelectItem value="Vencida">Vencida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {currentFactura ? 'Actualizar' : 'Guardar'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
