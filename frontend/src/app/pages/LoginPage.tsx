import { Eye, EyeOff, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

export function LoginPage() {
  const { login, user } = useApp();
  const navigate = useNavigate();

  const [ra, setRa] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      navigate(user.tipo === "aluno" ? "/aluno" : "/funcionario", { replace: true });
    }
  }, [user, navigate]);

  function handleLogin() {
    if (!ra.trim()) {
      toast.error("Informe seu RA ou usuário.");
      return;
    }
    if (!password.trim()) {
      toast.error("Informe sua senha.");
      return;
    }

    const loggedUser = login(ra, password);
    if (!loggedUser) {
      toast.error("Credenciais inválidas. Verifique seu RA/usuário.");
      return;
    }

    toast.success(`Bem-vindo(a), ${loggedUser.nome}!`);
    navigate(loggedUser.tipo === "aluno" ? "/aluno" : "/funcionario", { replace: true });
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-900 shadow-lg ring-4 ring-blue-200">
              <span className="text-2xl font-black text-white">A</span>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-black tracking-wide text-blue-900 uppercase">UNASP</h1>
              <p className="text-xs font-medium text-blue-600">Correio Interno</p>
            </div>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Bem-vindo</h2>
            <p className="mt-1 text-sm text-gray-500">Sistema de Correio Interno</p>
          </div>

          <div className="space-y-4">
            {/* RA / Usuário */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                RA / Usuário
              </label>
              <input
                type="text"
                placeholder="Ex: 123456 ou admin"
                value={ra}
                onChange={(e) => setRa(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* Senha */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleLogin}
              className="w-full rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Entrar
            </button>
          </div>

          {/* Credenciais de teste */}
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-blue-800">
              <Info size={14} />
              Credenciais de teste
            </div>
            <div className="space-y-1 text-xs text-blue-700">
              <p>
                <span className="font-semibold">Aluno:</span> RA: <code className="rounded bg-blue-100 px-1">123456</code> | Senha: qualquer
              </p>
              <p>
                <span className="font-semibold">Funcionário:</span> Usuário: <code className="rounded bg-blue-100 px-1">admin</code> | Senha: qualquer
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-blue-200">
          UNASP – Engenheiro Coelho
        </p>
      </div>
    </div>
  );
}
