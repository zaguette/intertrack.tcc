import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { UserTipo } from "../lib/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredTipo?: UserTipo;
}

export function ProtectedRoute({ children, requiredTipo }: ProtectedRouteProps) {
  const { user } = useApp();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredTipo && user.tipo !== requiredTipo) {
    return <Navigate to={user.tipo === "aluno" ? "/aluno" : "/funcionario"} replace />;
  }

  return <>{children}</>;
}
