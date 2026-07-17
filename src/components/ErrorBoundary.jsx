import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: "2rem", color: "#fff", background: "#0b0f1a", minHeight: "100vh", fontFamily: "sans-serif" }}>
          <h1 style={{ color: "#f87171" }}>Algo inesperado aconteceu ao carregar esta página</h1>
          <pre style={{ color: "#fbbf24", marginTop: "1rem", whiteSpace: "pre-wrap", fontSize: ".9rem" }}>
            {this.state.error.message}
          </pre>
          <pre style={{ color: "#94a3b8", marginTop: ".5rem", fontSize: ".78rem", whiteSpace: "pre-wrap" }}>
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
