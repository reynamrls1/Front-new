import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// IMPORTACIONES
import { LoginPage } from './components/LoginPage';
import { HomePage } from './components/HomePage';
import { Dashboard } from './components/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import authService from './services/authService';

export type UserRole = 'admin' | 'client' | 'employee';

function App() {
  const [userRole, setUserRole] = useState<UserRole>(() => {
    return authService.getCurrentUser().role;
  });

  // Efecto para sincronizar el rol si cambia externamente (opcional pero recomendado)
  useEffect(() => {
    const role = authService.getCurrentUser().role;
    if (role !== userRole) {
      setUserRole(role);
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>

          {/* 1. LA HOME PAGE ES PÚBLICA (Para que puedan ver los botones de registro) */}
          <Route path="/home" element={<HomePage onLogin={(role: UserRole) => setUserRole(role)} />} />

          {/* La raíz también lleva al home */}
          <Route path="/" element={<Navigate to="/home" />} />

          {/* El Login directo (por si alguien escribe /login) */}
          <Route path="/login" element={<LoginPage onLogin={(role: UserRole) => setUserRole(role)} />} />

          {/* Rutas de recuperación de contraseña */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />


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