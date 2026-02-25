import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Input } from "./ui/Input";
import { getStoredUsers, saveUsers } from "../lib/storage";
import { User, UserRole } from "../lib/types";

type RegisterFormProps = {
  onCancel: () => void;
  onRegistered: (user: User) => void;
};

export default function RegisterForm({ onCancel, onRegistered }: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role] = useState<UserRole>("student"); // apenas alunos podem se cadastrar

  function handleRegister() {
    if (!username.trim() || !name.trim() || !password) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    if (password.length < 4) {
      toast.error("Senha muito curta. Use ao menos 4 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    const existing = getStoredUsers();
    const normalized = username.trim().toLowerCase();
    if (existing.some((u) => u.username.trim().toLowerCase() === normalized)) {
      toast.error("Nome de usuário já existe. Escolha outro.");
      return;
    }

    const newUser: User = {
      username: username.trim(),
      password,
      name: name.trim(),
      role,
    };

    saveUsers([newUser, ...existing]);
    toast.success("Cadastro realizado. Você entrou como novo usuário.");
    onRegistered(newUser);
  }

  return (
    <Card className="relative z-10 w-full max-w-md mx-auto border-transparent shadow-lg">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRegister();
        }}
        className="flex flex-col items-stretch gap-6 p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-md bg-unasp-orange">
            <img src="/logounasp.png" alt="Logo UNASP" className="h-8 w-8 object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-unasp-navy">Cadastro de Usuário</h1>
            <p className="text-sm text-slate-500">Crie uma conta para acessar o sistema (somente alunos)</p>
          </div>
        </div>

        <div className="w-full grid gap-3">
          <Input
            label="Nome completo"
            placeholder="Ex: João Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <Input
            label="Usuário"
            placeholder="Escolha um usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              label="Senha"
              type="password"
              placeholder="Crie uma senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirmar senha"
              type="password"
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit">Cadastrar</Button>
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
