import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ImageWithFallback } from '../figma/ImageneWithFallback';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { Badge } from '../ui/badge';

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  productosCount: number;
}

export function CategoriasPage() {  
  const [categorias, setCategorias] = useState<Categoria[]>([
    { id: 1, nombre: 'Bebidas', descripcion: 'Bebidas frías y calientes', productosCount: 45 },
    { id: 2, nombre: 'Platos Principales', descripcion: 'Comidas principales', productosCount: 32 },
    { id: 3, nombre: 'Postres', descripcion: 'Postres y dulces', productosCount: 18 },
    { id: 4, nombre: 'Entradas', descripcion: 'Aperitivos y entradas', productosCount: 24 },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentCategoria, setCurrentCategoria] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    productosCount: 0,
  });

  const handleView = (categoria: Categoria) => {
    setCurrentCategoria(categoria);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (categoria: Categoria) => {
    setCurrentCategoria(categoria);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      productosCount: categoria.productosCount,
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de eliminar esta categoría?')) {
      setCategorias(categorias.filter(c => c.id !== id));
    }
  };

  const handleAdd = () => {
    setCurrentCategoria(null);
    setFormData({
      nombre: '',
      descripcion: '',
      productosCount: 0,
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCategoria) {
      setCategorias(categorias.map(c =>
        c.id === currentCategoria.id ? { ...c, ...formData } : c
      ));
    } else {
      setCategorias([...categorias, {
        id: Math.max(...categorias.map(c => c.id), 0) + 1,
        ...formData,
      }]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Banner with Image */}
      <Card className="relative p-0 border-0 overflow-hidden h-40">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1758657286956-f944e1d2e75a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbmV0d29yayUyMHBhdHRlcm58ZW58MXx8fHwxNzYyNDY1MzAxfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Categories banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-indigo-900/80"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-between px-8">
          <div className="text-white space-y-1">
            <h2 className="text-white text-3xl">Categorías</h2>
            <p className="text-purple-100">Organiza tu catálogo</p>
          </div>
          <Button onClick={handleAdd} className="relative group/add">
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-0 group-hover/add:opacity-100 transition-opacity duration-500 blur-lg"></span>
            <span className="relative z-10 flex items-center gap-2">
              <Plus className="w-4 h-4 group-hover/add:rotate-90 transition-transform duration-300" />
              Nueva Categoría
            </span>
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categorias.map((cat) => (
              <TableRow key={cat.id} className="hover:bg-blue-50/50 transition-colors">
                <TableCell className="text-gray-900">{cat.nombre}</TableCell>
                <TableCell className="text-gray-600">{cat.descripcion}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {cat.productosCount} productos
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleView(cat)}
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(cat)}
                      className="hover:bg-amber-50 hover:text-amber-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(cat.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isViewMode ? 'Ver' : currentCategoria ? 'Editar' : 'Nueva'} Categoría
            </DialogTitle>
          </DialogHeader>
          {isViewMode && currentCategoria ? (
            <div className="space-y-4">
              <div>
                <Label>ID</Label>
                <p className="text-slate-900 mt-1">{currentCategoria.id}</p>
              </div>
              <div>
                <Label>Nombre</Label>
                <p className="text-slate-900 mt-1">{currentCategoria.nombre}</p>
              </div>
              <div>
                <Label>Descripción</Label>
                <p className="text-slate-900 mt-1">{currentCategoria.descripcion}</p>
              </div>
              <div>
                <Label>Productos Asociados</Label>
                <p className="text-slate-900 mt-1">{currentCategoria.productosCount}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input 
                  id="nombre" 
                  placeholder="Ej: Bebidas"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="descripcion">Descripción *</Label>
                <Input 
                  id="descripcion" 
                  placeholder="Descripción breve"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="productosCount">Cantidad de Productos</Label>
                <Input 
                  id="productosCount" 
                  type="number"
                  placeholder="0"
                  value={formData.productosCount}
                  onChange={(e) => setFormData({ ...formData, productosCount: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 relative group/save">
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 opacity-0 group-hover/save:opacity-100 transition-opacity duration-500 blur-lg"></span>
                  <span className="relative z-10">
                    {currentCategoria ? 'Actualizar' : 'Guardar'}
                  </span>
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
