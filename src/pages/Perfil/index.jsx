import { useAuth } from "../../hooks/useAuth";

export default function Perfil() {
  const { user, userData } = useAuth();

  return (
    <div>
      <h1>Meu Perfil</h1>
      <p>Email: {user?.email}</p>
      <p>Nome: {userData?.nome || "Não definido"}</p>
    </div>
  );
}
