import { useState } from 'react';
// Usamos llaves { } para importar los componentes de las páginas
import { LoginPage } from './components/LoginPage';
import { HomePage } from './components/HomePage';
import { Dashboard } from './components/Dashboard';

export type UserRole = 'admin' | 'client' | 'employee';

// Quitamos la palabra 'export' de aquí para hacerlo al final
function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'home' | 'dashboard'>('login');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('login');
    setUserRole('admin');
  };

  const handleNavigate = (role: UserRole) => {
    setUserRole(role);
    setCurrentPage('dashboard');
  };

  const handleChangeRole = (role: UserRole) => {
    setUserRole(role);
  };

  return (
    <div className="min-h-screen">
      {currentPage === 'login' ? (
        <LoginPage onLogin={(role: any) => handleLogin(role as UserRole)} />
      ) : currentPage === 'home' ? (
        <HomePage 
          onNavigate={handleNavigate} 
          onLogout={handleLogout} 
          currentRole={userRole} 
        />
      ) : (
        <Dashboard 
          onNavigateHome={() => setCurrentPage('home')} 
          userRole={userRole}
          onChangeRole={handleChangeRole}
        />
      )}
    </div>
  );
}

export default App;