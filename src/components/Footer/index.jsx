import { memo } from "react";

function Footer() {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} Universo Relativo. Todos os direitos reservados.</p>
    </footer>
  );
}

export default memo(Footer);
