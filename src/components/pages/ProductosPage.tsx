import React, { useEffect, useState } from "react";
import productoService, { ProductDTO } from "../../services/productoService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from 'sonner';

export const ProductosPage: React.FC = () => {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [formData, setFormData] = useState<Partial<ProductDTO>>({ name: '', description: '', price: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await productoService.getAll();
      setProducts(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product?: ProductDTO) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: 0 });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast.error("Nombre y Precio son requeridos");
      return;
    }

    const payload: ProductDTO = {
      id: editingProduct?.id,
      name: formData.name,
      description: formData.description || '',
      price: formData.price
    };

    try {
      if (editingProduct) {
        await productoService.update(editingProduct.id!, payload);
        toast.success("Producto actualizado");
      } else {
        await productoService.create(payload);
        toast.success("Producto creado");
      }
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar producto");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await productoService.delete(id);
        toast.success("Producto eliminado");
        loadData();
      } catch (error) {
        toast.error("Error al eliminar");
      }
    }
  };

  const filteredProducts = products.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Productos</h1>
          <p className="text-gray-500 mt-1">Administra tu catálogo de productos.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      {/* Sub-header / Search */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-md border">
        <Search className="w-5 h-5 text-gray-400" />
        <Input
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 focus-visible:ring-0"
        />
      </div>

      {/* List */}
      <div className="bg-white rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Unidades Disponibles</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>${product.price.toLocaleString()}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${(product.calculatedStock !== undefined && product.calculatedStock !== null)
                      ? (product.calculatedStock < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')
                      : 'bg-gray-100 text-gray-700'
                    }`}>
                    {product.calculatedStock !== undefined ? product.calculatedStock : 'N/A'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id!)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No se encontraron productos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre</label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ej: Champú" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Detalles del producto" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Precio</label>
              <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              El stock se calcula automáticamente según los insumos disponibles y la receta del producto.
            </p>
            <Button className="w-full mt-4" onClick={handleSave}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

