import { useAuth } from "../../hooks/useAuth";

export default function Dashboard() {
  const { user, userData } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bem-vindo, {userData?.nome || user?.email}!</p>
    </div>
  );
}
