import React, { useEffect, useState } from 'react';
import insumosProductoService, { InsumosProductoDTO, InsumosProductoCreateDTO } from '../../services/insumosProductoService';
import productoService, { ProductDTO } from '../../services/productoService';
import insumoService, { InsumoDTO } from '../../services/insumoService';
import { medidasService, MedidaDTO } from '../../services/medidasService';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from 'sonner';

export const InsumosProductosPage: React.FC = () => {
  const [recipes, setRecipes] = useState<InsumosProductoDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [insumos, setInsumos] = useState<InsumoDTO[]>([]);
  const [measures, setMeasures] = useState<MedidaDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedInsumoId, setSelectedInsumoId] = useState<string>('');
  const [selectedMeasure, setSelectedMeasure] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recipesData, productsData, insumosData, measuresData] = await Promise.all([
        insumosProductoService.getAll(),
        productoService.getAll(),
        insumoService.getAll(),
        medidasService.getAll()
      ]);
      setRecipes(recipesData);
      setProducts(productsData);
      setInsumos(insumosData);
      setMeasures(measuresData);
    } catch (error) {
      console.error("Error loading data", error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (recipe?: InsumosProductoDTO) => {
    if (recipe) {
      setEditingId(recipe.id!);
      setSelectedProductId(recipe.productId?.toString() || '');
      setSelectedInsumoId(recipe.inputId?.toString() || '');
      setSelectedMeasure(recipe.measure || '');
      setAmount(recipe.amount.toString());
    } else {
      setEditingId(null);
      setSelectedProductId('');
      setSelectedInsumoId('');
      setSelectedMeasure('');
      setAmount('');
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedProductId || !selectedInsumoId || !selectedMeasure || !amount) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    const payload: InsumosProductoCreateDTO = {
      productId: parseInt(selectedProductId),
      inputId: parseInt(selectedInsumoId),
      measure: selectedMeasure,
      amount: parseFloat(amount)
    };

    try {
      if (editingId) {
        await insumosProductoService.update(editingId, payload);
        toast.success("Receta actualizada");
      } else {
        await insumosProductoService.create(payload);
        toast.success("Receta creada");
      }
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta relación?")) {
      try {
        await insumosProductoService.delete(id);
        toast.success("Eliminado correctamente");
        loadData();
      } catch (error) {
        toast.error("Error al eliminar");
      }
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Productos - Insumos (Recetas)</h1>
          <p className="text-gray-500">Define qué insumos necesitan tus productos.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Receta
        </Button>
      </div>

      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Insumo Requerido</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Medida</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recipes.map((recipe) => (
              <TableRow key={recipe.id}>
                <TableCell className="font-medium">{recipe.productName || '-'}</TableCell>
                <TableCell>{recipe.inputNombre || '-'}</TableCell>
                <TableCell>{recipe.amount}</TableCell>
                <TableCell>{recipe.measure}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(recipe)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(recipe.id!)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Receta' : 'Nueva Receta'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Producto</label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id?.toString() || ''}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Insumo</label>
              <Select value={selectedInsumoId} onValueChange={setSelectedInsumoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona insumo" />
                </SelectTrigger>
                <SelectContent>
                  {insumos.map(i => (
                    <SelectItem key={i.id} value={i.id!.toString()}>{i.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cantidad</label>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ej: 0.5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Medida</label>
                <Select value={selectedMeasure} onValueChange={setSelectedMeasure}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {measures.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button className="w-full mt-4" onClick={handleSubmit}>
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};


