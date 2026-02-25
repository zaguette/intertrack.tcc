import { useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";
import StaffView from "./components/StaffView";
import StudentView from "./components/StudentView";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";
import { Input } from "./components/ui/Input";
import { Select } from "./components/ui/Select";
import {
  clearSession,
  getStoredPackages,
  getStoredSession,
  getStoredUsers,
  savePackages,
  saveSession,
  saveUsers,
} from "./lib/storage";
import { PackageItem, User, UserRole } from "./lib/types";
import { Eye, EyeOff, LogOut } from "lucide-react";
import RegisterForm from "./components/RegisterForm";

const defaultUsers: User[] = [
  {
    username: "aluno",
    password: "123456",
    role: "student",
    name: "Aluno",
  },
  {
    username: "admin",
    password: "admin123",
    role: "staff",
    name: "Funcionário",
  },
];

function requestNotificationPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission().catch(() => undefined);
  }
}

export default function App() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const storedUsers = getStoredUsers();
    if (storedUsers.length === 0) {
      saveUsers(defaultUsers);
    }

    setPackages(getStoredPackages());
    setUser(getStoredSession());
  }, []);

  useEffect(() => {
    savePackages(packages);
  }, [packages]);

  useEffect(() => {
    if (user) {
      saveSession(user);
    }
  }, [user]);

  const headerSubtitle = useMemo(() => {
    if (!user) return "Correio interno do internato UNASP";
    return user.role === "staff"
      ? "Painel do funcionário"
      : `Olá, ${user.name}`;
  }, [user]);

  // TODO: INTEGRAÇÃO LDAP/ACTIVE DIRECTORY
  // Para produção, substituir esta função por autenticação LDAP/AD do UNASP
  // O login deve usar as mesmas credenciais do sistema de internet do internato
  // Exemplo de integração:
  // async function handleLogin() {
  //   try {
  //     const response = await fetch('/api/auth/ldap', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ username, password, role })
  //     });
  //     const userData = await response.json();
  //     if (userData.authenticated) {
  //       setUser(userData.user);
  //       requestNotificationPermission();
  //       toast.success('Login realizado com sucesso.');
  //     }
  //   } catch (error) {
  //     toast.error('Erro ao autenticar. Tente novamente.');
  //   }
  // }
  
  function handleLogin() {
    const storedUsers = getStoredUsers();
    const match = storedUsers.find(
      (candidate) =>
        candidate.username === username.trim() &&
        candidate.password === password &&
        candidate.role === role
    );

    if (!match) {
      toast.error("Credenciais inválidas. Verifique usuário, senha e perfil.");
      return;
    }

    setUser(match);
    requestNotificationPermission();
    toast.success("Login realizado com sucesso.");
  }

  function handleLogout() {
    clearSession();
    setUser(null);
    setUsername("");
    setPassword("");
    setRole("student");
  }

  function notifyAvailable(item: PackageItem) {
    if (!user || user.role !== "staff") return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const notification = new Notification("Encomenda disponível", {
      body: `${item.studentName}, sua encomenda ${item.code} já pode ser retirada.`,
    });

    setTimeout(() => notification.close(), 5000);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster richColors position="top-right" />
      
      {!user ? (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#003d7a] via-[#004d94] to-[#e8744f] p-4">
          {/* Padrão de fundo com caixinhas */}
          <div className="absolute inset-0">
            <div className="h-full w-full opacity-40" style={{
              backgroundImage: `url("/caixa.png")`,
              backgroundSize: '80px 80px',
              backgroundRepeat: 'repeat',
              filter: 'brightness(0) invert(1)',
            }} />
          </div>
          <Card className="relative z-10 w-full max-w-md">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-unasp-orange">
                <img 
                  src="/logounasp.png" 
                  alt="Logo UNASP" 
                  className="h-26 w-26 object-contain"
                />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-unasp-navy">
                  UNASP Correio Interno
                </h1>
                <p className="text-sm text-slate-500">
                  Sistema de gerenciamento de encomendas do internato
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setRole("student")}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  role === "student"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                👤 Aluno
              </button>
              <button
                onClick={() => setRole("staff")}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  role === "staff"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                👨‍💼 Funcionário
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <Input
                label="Usuário"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <div className="relative">
                <Input
                  label="Senha"
                  placeholder="Digite sua senha"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-[42px] text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <Button onClick={handleLogin} className="w-full">
                Entrar
              </Button>
            </div>

          <div className="mt-4 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-slate-500">
              Não tem login?{' '}
              <button
                type="button"
                onClick={() => setShowRegister(true)}
                className="ml-1 underline font-medium text-unasp-navy"
              >
                Cadastre-se aqui
              </button>
            </p>
           </div>
          
           {showRegister && (
             <div className="absolute inset-0 grid place-items-center bg-black/40 p-4">
               <RegisterForm
                 onCancel={() => setShowRegister(false)}
                 onRegistered={(newUser: User) => {
                   setUser(newUser);
                   setShowRegister(false);
                 }}
               />
             </div>
           )}
          </Card>
          
          {/* Ícone de ajuda */}
          <button
            className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-600 shadow-lg transition hover:bg-slate-50 hover:shadow-xl"
            onClick={() => toast.info('Sistema de Correio Interno do UNASP\n\nPara testes:\nAluno: aluno / 123456\nFuncionário: admin / admin123')}
            aria-label="Ajuda"
          >
            <span className="text-xl font-semibold">?</span>
          </button>
        </div>
      ) : (
        <>
          <header className="border-b border-slate-100 bg-unasp-navy text-white">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-unasp-orange">
                  <img 
                    src="/logounasp.png" 
                    alt="Logo UNASP" 
                    className="h-6 w-6 object-contain"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold">UNASP Correio Interno</p>
                  <p className="text-xs text-blue-200">
                    {user.role === "staff" ? "Painel do Funcionário - Funcionário Admin" : `Bem-vindo(a), ${user.name}`}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                <LogOut size={16} />
                Sair
              </Button>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl px-4 py-8">
            {user.role === "staff" ? (
          <StaffView
            packages={packages}
            onPackagesChange={setPackages}
            onNotifyAvailable={notifyAvailable}
          />
            ) : (
              <StudentView packages={packages} user={user} />
            )}
          </main>
        </>
      )}
    </div>
  );
}
