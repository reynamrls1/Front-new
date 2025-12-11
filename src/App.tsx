import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// IMPORTACIONES
import { LoginPage } from './components/LoginPage';
import { HomePage } from './components/HomePage';
import { Dashboard } from './components/Dashboard'; 
import { ProtectedRoute } from './components/ProtectedRoute';

export type UserRole = 'admin' | 'client' | 'employee';

function App() {
  const [userRole, setUserRole] = useState<UserRole>('admin');

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>
          
          {/* 1. LA HOME PAGE ES PÚBLICA (Para que puedan ver los botones de registro) */}
          <Route path="/home" element={<HomePage />} />
          
          {/* La raíz también lleva al home */}
          <Route path="/" element={<Navigate to="/home" />} />

          {/* El Login directo (por si alguien escribe /login) */}
          <Route path="/login" element={<LoginPage onLogin={() => {}} />} />


          {/* 2. EL DASHBOARD ES EL QUE ESTÁ PROTEGIDO (Solo entran si están registrados) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard 
                  onNavigateHome={() => window.location.href = '/home'} 
                  userRole={userRole}
                  onChangeRole={(role: UserRole) => setUserRole(role)}
                />
              </ProtectedRoute>
            } 
          />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;