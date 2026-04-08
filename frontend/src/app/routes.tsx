import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { StudentConsultar } from "./pages/student/StudentConsultar";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { StudentHistorico } from "./pages/student/StudentHistorico";
import { StudentPerfil } from "./pages/student/StudentPerfil";
import { StaffCadastrar } from "./pages/staff/StaffCadastrar";
import { StaffDashboard } from "./pages/staff/StaffDashboard";
import { StaffGraficos } from "./pages/staff/StaffGraficos";
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
    path: "/aluno/historico",
    element: (
      <ProtectedRoute requiredTipo="aluno">
        <StudentHistorico />
      </ProtectedRoute>
    ),
  },
  {
    path: "/aluno/perfil",
    element: (
      <ProtectedRoute requiredTipo="aluno">
        <StudentPerfil />
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
    path: "/funcionario/graficos",
    element: (
      <ProtectedRoute requiredTipo="funcionario">
        <StaffGraficos />
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
