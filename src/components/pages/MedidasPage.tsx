import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Medida {
  id: number;
  nombre: string;
  abreviatura: string;
  tipo: string;
}

export function MedidasPage() {
  const [medidas, setMedidas] = useState<Medida[]>([
    { id: 1, nombre: 'Kilogramo', abreviatura: 'kg', tipo: 'Peso' },
    { id: 2, nombre: 'Litro', abreviatura: 'L', tipo: 'Volumen' },
    { id: 3, nombre: 'Unidad', abreviatura: 'ud', tipo: 'Cantidad' },
    { id: 4, nombre: 'Gramo', abreviatura: 'g', tipo: 'Peso' },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentMedida, setCurrentMedida] = useState<Medida | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    abreviatura: '',
    tipo: 'Peso',
  });

  const handleView = (medida: Medida) => {
    setCurrentMedida(medida);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (medida: Medida) => {
    setCurrentMedida(medida);
    setFormData({
      nombre: medida.nombre,
      abreviatura: medida.abreviatura,
      tipo: medida.tipo,
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de eliminar esta unidad de medida?')) {
      setMedidas(medidas.filter(m => m.id !== id));
    }
  };

  const handleAdd = () => {
    setCurrentMedida(null);
    setFormData({
      nombre: '',
      abreviatura: '',
      tipo: 'Peso',
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMedida) {
      setMedidas(medidas.map(m =>
        m.id === currentMedida.id ? { ...m, ...formData } : m
      ));
    } else {
      setMedidas([...medidas, {
        id: Math.max(...medidas.map(m => m.id), 0) + 1,
        ...formData,
      }]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-gray-900">Medidas</h2>
          <p className="text-gray-600">Unidades de medida del sistema</p>
        </div>
        <Button onClick={handleAdd} className="relative group/medida">
          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-0 group-hover/medida:opacity-100 transition-opacity duration-500 blur-lg"></span>
          <span className="relative z-10 flex items-center gap-2">
            <Plus className="w-4 h-4 group-hover/medida:rotate-90 transition-transform duration-300" />
            Nueva Medida
          </span>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <TableHead>Nombre</TableHead>
              <TableHead>Abreviatura</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medidas.map((medida) => (
              <TableRow key={medida.id} className="hover:bg-blue-50/50 transition-colors">
                <TableCell className="text-gray-900">{medida.nombre}</TableCell>
                <TableCell>{medida.abreviatura}</TableCell>
                <TableCell>{medida.tipo}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleView(medida)}
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(medida)}
                      className="hover:bg-amber-50 hover:text-amber-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(medida.id)}
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
              {isViewMode ? 'Ver' : currentMedida ? 'Editar' : 'Nueva'} Unidad de Medida
            </DialogTitle>
          </DialogHeader>
          {isViewMode && currentMedida ? (
            <div className="space-y-4">
              <div>
                <Label>ID</Label>
                <p className="text-slate-900 mt-1">{currentMedida.id}</p>
              </div>
              <div>
                <Label>Nombre</Label>
                <p className="text-slate-900 mt-1">{currentMedida.nombre}</p>
              </div>
              <div>
                <Label>Abreviatura</Label>
                <p className="text-slate-900 mt-1">{currentMedida.abreviatura}</p>
              </div>
              <div>
                <Label>Tipo</Label>
                <p className="text-slate-900 mt-1">{currentMedida.tipo}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input 
                  id="nombre" 
                  placeholder="Ej: Kilogramo"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="abreviatura">Abreviatura *</Label>
                <Input 
                  id="abreviatura" 
                  placeholder="Ej: kg"
                  value={formData.abreviatura}
                  onChange={(e) => setFormData({ ...formData, abreviatura: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Peso">Peso</SelectItem>
                    <SelectItem value="Volumen">Volumen</SelectItem>
                    <SelectItem value="Cantidad">Cantidad</SelectItem>
                    <SelectItem value="Longitud">Longitud</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {currentMedida ? 'Actualizar' : 'Guardar'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
