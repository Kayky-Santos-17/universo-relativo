import { memo } from "react";

function Loading({ message = "Carregando..." }) {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p>{message}</p>
    </div>
  );
}

export default memo(Loading);
