import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react'; // <--- 1. IMPORTA ESTO

interface Props {
  children: ReactNode; // <--- 2. CAMBIA 'JSX.Element' POR 'ReactNode'
}

export const ProtectedRoute = ({ children }: Props) => {
  const token = localStorage.getItem('jwt_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>; // <--- 3. Envuelve children en fragmentos <>...</> por seguridad
};