import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';


interface Condicion {
  id: number;
  name: string;
}

export function CondicionPage() {
  const [condiciones, setCondiciones] = useState<Condicion[]>([
    { id: 1, name: 'Pendiente' },
    { id: 2, name: 'En Proceso' },
    { id: 3, name: 'Completado' },
    { id: 4, name: 'Cancelado' },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentCondicion, setCurrentCondicion] = useState<Condicion | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  const handleView = (condicion: Condicion) => {
    setCurrentCondicion(condicion);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (condicion: Condicion) => {
    setCurrentCondicion(condicion);
    setFormData({ name: condicion.name });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de eliminar esta condición?')) {
      setCondiciones(condiciones.filter(c => c.id !== id));
    }
  };

  const handleAdd = () => {
    setCurrentCondicion(null);
    setFormData({ name: '' });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCondicion) {
      setCondiciones(condiciones.map(c =>
        c.id === currentCondicion.id ? { ...c, ...formData } : c
      ));
    } else {
      setCondiciones([...condiciones, {
        id: Math.max(...condiciones.map(c => c.id), 0) + 1,
        ...formData,
      }]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-slate-900 tracking-tight">Condiciones</h2>
          <p className="text-slate-600">Gestiona las condiciones de pedidos y reservaciones</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Nueva Condición
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <TableHead>ID</TableHead>
              <TableHead>Nombre de la Condición</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {condiciones.map((condicion) => (
              <TableRow key={condicion.id} className="hover:bg-blue-50/50 transition-colors">
                <TableCell>{condicion.id}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {condicion.name}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(condicion)}
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(condicion)}
                      className="hover:bg-amber-50 hover:text-amber-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(condicion.id)}
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
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isViewMode ? 'Ver' : currentCondicion ? 'Editar' : 'Nueva'} Condición
            </DialogTitle>
          </DialogHeader>
          {isViewMode && currentCondicion ? (
            <div className="space-y-4">
              <div>
                <Label>ID</Label>
                <p className="text-slate-900 mt-1">{currentCondicion.id}</p>
              </div>
              <div>
                <Label>Nombre de la Condición</Label>
                <p className="text-slate-900 mt-1">{currentCondicion.name}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre de la Condición *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Pendiente, Completado..."
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {currentCondicion ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
