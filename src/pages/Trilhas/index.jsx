import { useParams } from "react-router-dom";

export default function Trilhas() {
  const { slug } = useParams();

  return (
    <div>
      <h1>Trilhas de Aprendizagem</h1>
      {slug ? <p>Detalhes da trilha: {slug}</p> : <p>Lista de trilhas gamificadas.</p>}
    </div>
  );
}
