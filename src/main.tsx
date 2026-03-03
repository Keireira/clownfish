import { createRoot } from "react-dom/client";
import { Component, type ReactNode } from "react";
import "./theme.css";
import { initTheme } from "./theme";
import { initLanguage } from "./i18n";

// Kick off theme init (localStorage inline script prevents flash; this confirms from store)
initTheme();
initLanguage();

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: "#ff0000", color: "#fff", padding: 16, fontSize: 13, fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-all", borderRadius: 8 }}>
          <b>React Error:</b>{"\n"}{this.state.error.message}{"\n"}{this.state.error.stack}
        </div>
      );
    }
    return this.props.children;
  }
}

const root = createRoot(document.getElementById("root")!);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const label = (window as any).__TAURI_INTERNALS__?.metadata?.currentWindow?.label as string | undefined;

if (label === "settings") {
  import("./Settings").then(
    ({ default: Settings }) => {
      root.render(<Settings />);
    }
  ).catch((e) => {
    root.render(<div style={{ color: "red", padding: 16 }}>Settings load error: {String(e)}</div>);
  });
} else {
  import("./App").then(({ default: App }) => {
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  }).catch((e) => {
    root.render(<div style={{ color: "red", padding: 16 }}>App load error: {String(e)}</div>);
  });
}
