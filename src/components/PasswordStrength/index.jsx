export default function PasswordStrength({ senha, forca }) {
  if (!senha) return null;

  const percent = (forca.nivel / 5) * 100;

  return (
    <div className="senha-strength">
      <div className="senha-strength-bar">
        <div
          className="senha-strength-fill"
          style={{ width: `${percent}%`, backgroundColor: forca.cor }}
        />
      </div>
      {forca.label && (
        <span className="senha-strength-label" style={{ color: forca.cor }}>
          {forca.label}
        </span>
      )}
    </div>
  );
}
