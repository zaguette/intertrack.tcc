import { Eye, EyeOff, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

export function LoginPage() {
  const { login, register, user } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">("login");
  const isRegister = mode === "register";

  const [fullName, setFullName] = useState("");
  const [ra, setRa] = useState("");
  const [contact, setContact] = useState("");
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
      toast.error("Informe seu RA.");
      return;
    }
    if (!password.trim()) {
      toast.error("Informe sua senha.");
      return;
    }

    const loggedUser = login(ra, password);
    if (!loggedUser) {
      toast.error("Credenciais inválidas. Verifique seu RA e senha.");
      return;
    }

    toast.success(`Bem-vindo(a), ${loggedUser.nome}!`);
    navigate(loggedUser.tipo === "aluno" ? "/aluno" : "/funcionario", { replace: true });
  }

  function handleRegister() {
    if (!fullName.trim()) {
      toast.error("Informe seu nome completo.");
      return;
    }
    if (!ra.trim()) {
      toast.error("Informe seu RA.");
      return;
    }
    if (!contact.trim()) {
      toast.error("Informe seu telefone ou e-mail.");
      return;
    }
    if (!password.trim()) {
      toast.error("Informe sua senha.");
      return;
    }

    const result = register({
      nome: fullName,
      ra,
      contato: contact,
      senha: password,
    });

    if (!result.ok) {
      toast.error(result.error ?? "Não foi possível cadastrar.");
      return;
    }

    const loggedUser = login(ra, password);
    if (!loggedUser) {
      toast.success("Cadastro realizado com sucesso. Faça seu login.");
      setMode("login");
      return;
    }

    toast.success(`Cadastro realizado. Bem-vindo(a), ${loggedUser.nome}!`);
    navigate("/aluno", { replace: true });
  }

  function switchMode(nextMode: "login" | "register") {
    setMode(nextMode);
    setShowPassword(false);
    setPassword("");

    if (nextMode === "login") {
      setFullName("");
      setContact("");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-4">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/campus.png')" }}
      />
      <div className="absolute inset-0 bg-blue-950/60" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-500 shadow-lg ring-4 ring-orange-200">
              <img src="/logounasp.png" alt="UNASP Logo" className="h-[5.5rem] w-[5.5rem] object-contain" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-black tracking-wide text-blue-900 uppercase">UNASP</h1>
              <p className="text-xs font-medium text-blue-600">Correio Interno</p>
            </div>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {isRegister ? "Criar cadastro" : "Bem-vindo"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {isRegister ? "Cadastre-se para acessar como aluno" : "Sistema de Correio Interno"}
            </p>
          </div>

          <div className="space-y-4">
            {isRegister && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Nome completo
                </label>
                <input
                  type="text"
                  placeholder="Ex: João da Silva"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            )}

            {/* RA / Usuário */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                RA
              </label>
              <input
                type="text"
                placeholder="Ex: 123456"
                value={ra}
                onChange={(e) => setRa(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (isRegister ? handleRegister() : handleLogin())}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {isRegister && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Telefone ou e-mail
                </label>
                <input
                  type="text"
                  placeholder="Ex: (19) 99999-9999 ou aluno@email.com"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            )}

            {/* Senha */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (isRegister ? handleRegister() : handleLogin())}
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
              onClick={isRegister ? handleRegister : handleLogin}
              className="w-full rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isRegister ? "Cadastrar" : "Entrar"}
            </button>

            {isRegister ? (
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="w-full text-sm font-medium text-blue-700 hover:text-blue-900"
              >
                Já tem conta? Entrar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="w-full text-sm font-medium text-blue-700 hover:text-blue-900"
              >
                Cadastrar
              </button>
            )}
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
                <span className="font-semibold">Funcionário:</span> RA: <code className="rounded bg-blue-100 px-1">999999</code> | Senha: qualquer
              </p>
              <p>
                <span className="font-semibold">Novo aluno:</span> use a aba <strong>Cadastrar</strong> para criar sua conta.
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
