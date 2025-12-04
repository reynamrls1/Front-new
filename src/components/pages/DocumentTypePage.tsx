import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface DocumentType {
  id: number;
  initials: string;
  name: string;
  status: 'Activo' | 'Inactivo';
}

export function DocumentTypePage() {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([
    { id: 1, initials: 'CC', name: 'Cédula de Ciudadanía', status: 'Activo' },
    { id: 2, initials: 'CE', name: 'Cédula de Extranjería', status: 'Activo' },
    { id: 3, initials: 'PP', name: 'Pasaporte', status: 'Activo' },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentDocType, setCurrentDocType] = useState<DocumentType | null>(null);
  const [formData, setFormData] = useState({
    initials: '',
    name: '',
    status: 'Activo' as 'Activo' | 'Inactivo',
  });

  const handleView = (docType: DocumentType) => {
    setCurrentDocType(docType);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (docType: DocumentType) => {
    setCurrentDocType(docType);
    setFormData({
      initials: docType.initials,
      name: docType.name,
      status: docType.status,
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de eliminar este tipo de documento?')) {
      setDocumentTypes(documentTypes.filter(dt => dt.id !== id));
    }
  };

  const handleAdd = () => {
    setCurrentDocType(null);
    setFormData({ initials: '', name: '', status: 'Activo' });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentDocType) {
      setDocumentTypes(documentTypes.map(dt =>
        dt.id === currentDocType.id ? { ...dt, ...formData } : dt
      ));
    } else {
      setDocumentTypes([...documentTypes, {
        id: Math.max(...documentTypes.map(dt => dt.id), 0) + 1,
        ...formData,
      }]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-slate-900 tracking-tight">Tipos de Documento</h2>
          <p className="text-slate-600">Gestiona los tipos de documentos de identificación</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Tipo
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <TableHead>ID</TableHead>
              <TableHead>Iniciales</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documentTypes.map((docType) => (
              <TableRow key={docType.id} className="hover:bg-blue-50/50 transition-colors">
                <TableCell>{docType.id}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {docType.initials}
                  </Badge>
                </TableCell>
                <TableCell>{docType.name}</TableCell>
                <TableCell>
                  <Badge variant={docType.status === 'Activo' ? 'default' : 'secondary'}>
                    {docType.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(docType)}
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(docType)}
                      className="hover:bg-amber-50 hover:text-amber-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(docType.id)}
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
              {isViewMode ? 'Ver' : currentDocType ? 'Editar' : 'Nuevo'} Tipo de Documento
            </DialogTitle>
          </DialogHeader>
          {isViewMode && currentDocType ? (
            <div className="space-y-4">
              <div>
                <Label>ID</Label>
                <p className="text-slate-900 mt-1">{currentDocType.id}</p>
              </div>
              <div>
                <Label>Iniciales</Label>
                <p className="text-slate-900 mt-1">{currentDocType.initials}</p>
              </div>
              <div>
                <Label>Nombre</Label>
                <p className="text-slate-900 mt-1">{currentDocType.name}</p>
              </div>
              <div>
                <Label>Estado</Label>
                <Badge className="mt-1" variant={currentDocType.status === 'Activo' ? 'default' : 'secondary'}>
                  {currentDocType.status}
                </Badge>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="initials">Iniciales *</Label>
                <Input
                  id="initials"
                  value={formData.initials}
                  onChange={(e) => setFormData({ ...formData, initials: e.target.value.toUpperCase() })}
                  placeholder="CC, CE, PP..."
                  maxLength={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">Nombre del Tipo de Documento *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Cédula de Ciudadanía"
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Estado *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'Activo' | 'Inactivo') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {currentDocType ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
