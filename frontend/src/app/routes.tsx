import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { StudentConsultar } from "./pages/student/StudentConsultar";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { StaffCadastrar } from "./pages/staff/StaffCadastrar";
import { StaffDashboard } from "./pages/staff/StaffDashboard";
import { StaffGerenciar } from "./pages/staff/StaffGerenciar";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/aluno",
    element: (
      <ProtectedRoute requiredTipo="aluno">
        <StudentDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/aluno/consultar",
    element: (
      <ProtectedRoute requiredTipo="aluno">
        <StudentConsultar />
      </ProtectedRoute>
    ),
  },
  {
    path: "/funcionario",
    element: (
      <ProtectedRoute requiredTipo="funcionario">
        <StaffDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/funcionario/cadastrar",
    element: (
      <ProtectedRoute requiredTipo="funcionario">
        <StaffCadastrar />
      </ProtectedRoute>
    ),
  },
  {
    path: "/funcionario/gerenciar",
    element: (
      <ProtectedRoute requiredTipo="funcionario">
        <StaffGerenciar />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
