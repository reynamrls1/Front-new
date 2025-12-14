import React, { useEffect, useState } from "react";
import insumoService, { InsumoDTO } from "../../services/insumoService";
import { medidasService, MedidaDTO } from "../../services/medidasService";
import { ingresoInsumoService, IngresoInsumoDTO } from "../../services/ingresoInsumoService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Plus, Pencil, Trash2, PackagePlus, Search } from "lucide-react";
import { toast } from 'sonner';

export const InsumoPage: React.FC = () => {
  const [insumos, setInsumos] = useState<InsumoDTO[]>([]);
  const [measures, setMeasures] = useState<MedidaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Create/Edit Dialog State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<InsumoDTO | null>(null);
  const [formData, setFormData] = useState<Partial<InsumoDTO>>({ nombre: '', marca: '', cantidad: 0, medida: '' });

  // Add Stock Dialog State
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [selectedInsumoId, setSelectedInsumoId] = useState<string>("");
  const [stockAmount, setStockAmount] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [insumosData, measuresData] = await Promise.all([
        insumoService.getAll(),
        medidasService.getAll()
      ]);
      setInsumos(insumosData);
      setMeasures(measuresData);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar insumos");
    } finally {
      setLoading(false);
    }
  };

  // --- CREATE / EDIT ---
  const handleOpenCreate = (insumo?: InsumoDTO) => {
    if (insumo) {
      setEditingInsumo(insumo);
      setFormData({
        nombre: insumo.nombre,
        marca: insumo.marca,
        cantidad: insumo.cantidad,
        medida: insumo.medida
      });
    } else {
      setEditingInsumo(null);
      setFormData({ nombre: '', marca: '', cantidad: 0, medida: '' });
    }
    setIsCreateOpen(true);
  };

  const handleSaveInsumo = async () => {
    if (!formData.nombre || !formData.medida) {
      toast.error("Nombre y Medida son obligatorios");
      return;
    }

    const payload: InsumoDTO = {
      id: editingInsumo?.id,
      nombre: formData.nombre,
      marca: formData.marca,
      cantidad: formData.cantidad || 0,
      medida: formData.medida,
      categoriaId: 1 // Default cat for now or add selector
    };

    try {
      if (editingInsumo) {
        await insumoService.update(editingInsumo.id!, payload);
        toast.success("Insumo actualizado");
      } else {
        await insumoService.create(payload);
        toast.success("Insumo creado");
      }
      setIsCreateOpen(false);
      loadData();
    } catch (error) {
      toast.error("Error al guardar insumo");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este insumo?")) {
      try {
        await insumoService.delete(id);
        toast.success("Insumo eliminado");
        loadData();
      } catch (error) {
        toast.error("Error al eliminar");
      }
    }
  };

  // --- ADD STOCK ---
  const handleAddStock = async () => {
    if (!selectedInsumoId || !stockAmount) {
      toast.error("Selecciona insumo y cantidad");
      return;
    }

    const insumo = insumos.find(i => i.id?.toString() === selectedInsumoId);
    if (!insumo) return;

    const payload: IngresoInsumoDTO = {
      amount: parseFloat(stockAmount),
      inputId: insumo.id!,
      measure: insumo.medida || 'UNIDAD', // Inherit measure
    };

    try {
      await ingresoInsumoService.create(payload);
      toast.success("Stock agregado correctamente");
      setIsAddStockOpen(false);
      setStockAmount("");
      setSelectedInsumoId("");
      loadData();
    } catch (error) {
      console.error(error);
      toast.error("Error al agregar stock");
    }
  };

  const filteredInsumos = insumos.filter(i =>
    (i.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Insumos</h1>
          <p className="text-gray-500 mt-1">Gestiona el inventario de ingredientes.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddStockOpen(true)} className="bg-green-600 hover:bg-green-700">
            <PackagePlus className="mr-2 h-4 w-4" />
            Ingreso Stock
          </Button>
          <Button onClick={() => handleOpenCreate()}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Insumo
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 bg-white p-2 rounded-md border">
          <Search className="w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar insumo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 focus-visible:ring-0"
          />
        </div>

        <div className="bg-white rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Stock Actual</TableHead>
                <TableHead>Medida</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInsumos.map((insumo) => (
                <TableRow key={insumo.id}>
                  <TableCell className="font-medium">{insumo.nombre}</TableCell>
                  <TableCell>{insumo.marca || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${(insumo.cantidad || 0) < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                      {(insumo.cantidad || 0).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>{insumo.medida}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenCreate(insumo)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(insumo.id!)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInsumos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No se encontraron insumos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingInsumo ? 'Editar Insumo' : 'Nuevo Insumo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre</label>
              <Input value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} placeholder="Ej: Harina" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Marca</label>
              <Input value={formData.marca} onChange={e => setFormData({ ...formData, marca: e.target.value })} placeholder="Ej: Haz de Oros" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cantidad Inicial</label>
              <Input type="number" value={formData.cantidad} onChange={e => setFormData({ ...formData, cantidad: parseFloat(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Medida</label>
              <Select
                value={formData.medida || ""}
                onValueChange={(val) => setFormData({ ...formData, medida: val })}
              >
                <SelectTrigger className={!formData.medida ? "text-muted-foreground" : ""}>
                  <SelectValue placeholder="Selecciona unidad" />
                </SelectTrigger>
                <SelectContent>
                  {measures.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full mt-4" onClick={handleSaveInsumo}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Stock Dialog */}
      <Dialog open={isAddStockOpen} onOpenChange={setIsAddStockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ingreso de Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Cantidad a Agregar</label>
              <Input type="number" value={stockAmount} onChange={e => setStockAmount(e.target.value)} placeholder="0.00" />
            </div>
            <Button className="w-full mt-4 bg-green-600 hover:bg-green-700" onClick={handleAddStock}>
              Agregar Stock
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};


