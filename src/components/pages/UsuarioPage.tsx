import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Eye, Edit, Trash2, Plus, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Usuario {
  id: number;
  documentNumber: string;
  firstName: string;
  secondName: string;
  lastName: string;
  secondLastName: string;
  phone: string;
  birthDate: string;
  username: string;
  documentType: string;
}

export function UsuarioPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    {
      id: 1,
      documentNumber: '1234567890',
      firstName: 'Juan',
      secondName: 'Carlos',
      lastName: 'Pérez',
      secondLastName: 'González',
      phone: '3001234567',
      birthDate: '1990-05-15',
      username: 'jperez',
      documentType: 'CC',
    },
    {
      id: 2,
      documentNumber: '9876543210',
      firstName: 'María',
      secondName: 'Isabel',
      lastName: 'Rodríguez',
      secondLastName: 'López',
      phone: '3109876543',
      birthDate: '1985-08-22',
      username: 'mrodriguez',
      documentType: 'CC',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    documentNumber: '',
    firstName: '',
    secondName: '',
    lastName: '',
    secondLastName: '',
    phone: '',
    birthDate: '',
    username: '',
    documentType: 'CC',
  });

  const filteredUsuarios = usuarios.filter(u =>
    u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.documentNumber.includes(searchTerm) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (usuario: Usuario) => {
    setCurrentUsuario(usuario);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (usuario: Usuario) => {
    setCurrentUsuario(usuario);
    setFormData(usuario);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      setUsuarios(usuarios.filter(u => u.id !== id));
    }
  };

  const handleAdd = () => {
    setCurrentUsuario(null);
    setFormData({
      documentNumber: '',
      firstName: '',
      secondName: '',
      lastName: '',
      secondLastName: '',
      phone: '',
      birthDate: '',
      username: '',
      documentType: 'CC',
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUsuario) {
      setUsuarios(usuarios.map(u =>
        u.id === currentUsuario.id ? { ...u, ...formData } : u
      ));
    } else {
      setUsuarios([...usuarios, {
        id: Math.max(...usuarios.map(u => u.id), 0) + 1,
        ...formData,
      }]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-slate-900 tracking-tight">Usuarios</h2>
          <p className="text-slate-600">Gestiona los usuarios del sistema</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Buscar por nombre, documento o usuario..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <TableHead>ID</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Tipo Doc</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsuarios.map((usuario) => (
                <TableRow key={usuario.id} className="hover:bg-blue-50/50 transition-colors">
                  <TableCell>{usuario.id}</TableCell>
                  <TableCell>{usuario.documentNumber}</TableCell>
                  <TableCell>
                    {usuario.firstName} {usuario.secondName} {usuario.lastName} {usuario.secondLastName}
                  </TableCell>
                  <TableCell>{usuario.phone}</TableCell>
                  <TableCell>{usuario.username}</TableCell>
                  <TableCell>{usuario.documentType}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(usuario)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(usuario)}
                        className="hover:bg-amber-50 hover:text-amber-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(usuario.id)}
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
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isViewMode ? 'Ver' : currentUsuario ? 'Editar' : 'Nuevo'} Usuario
            </DialogTitle>
          </DialogHeader>
          {isViewMode && currentUsuario ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ID</Label>
                <p className="text-slate-900 mt-1">{currentUsuario.id}</p>
              </div>
              <div>
                <Label>Número de Documento</Label>
                <p className="text-slate-900 mt-1">{currentUsuario.documentNumber}</p>
              </div>
              <div>
                <Label>Primer Nombre</Label>
                <p className="text-slate-900 mt-1">{currentUsuario.firstName}</p>
              </div>
              <div>
                <Label>Segundo Nombre</Label>
                <p className="text-slate-900 mt-1">{currentUsuario.secondName}</p>
              </div>
              <div>
                <Label>Primer Apellido</Label>
                <p className="text-slate-900 mt-1">{currentUsuario.lastName}</p>
              </div>
              <div>
                <Label>Segundo Apellido</Label>
                <p className="text-slate-900 mt-1">{currentUsuario.secondLastName}</p>
              </div>
              <div>
                <Label>Teléfono</Label>
                <p className="text-slate-900 mt-1">{currentUsuario.phone}</p>
              </div>
              <div>
                <Label>Fecha de Nacimiento</Label>
                <p className="text-slate-900 mt-1">{currentUsuario.birthDate}</p>
              </div>
              <div>
                <Label>Usuario</Label>
                <p className="text-slate-900 mt-1">{currentUsuario.username}</p>
              </div>
              <div>
                <Label>Tipo de Documento</Label>
                <p className="text-slate-900 mt-1">{currentUsuario.documentType}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documentType">Tipo de Documento *</Label>
                  <Select
                    value={formData.documentType}
                    onValueChange={(value) => setFormData({ ...formData, documentType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CC">CC - Cédula de Ciudadanía</SelectItem>
                      <SelectItem value="CE">CE - Cédula de Extranjería</SelectItem>
                      <SelectItem value="PP">PP - Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="documentNumber">Número de Documento *</Label>
                  <Input
                    id="documentNumber"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="firstName">Primer Nombre *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="secondName">Segundo Nombre</Label>
                  <Input
                    id="secondName"
                    value={formData.secondName}
                    onChange={(e) => setFormData({ ...formData, secondName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Primer Apellido *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="secondLastName">Segundo Apellido</Label>
                  <Input
                    id="secondLastName"
                    value={formData.secondLastName}
                    onChange={(e) => setFormData({ ...formData, secondLastName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Número de Teléfono *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="username">Usuario *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {currentUsuario ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
