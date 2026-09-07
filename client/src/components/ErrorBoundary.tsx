import React from "react";

type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("OjaX UI error", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="empty" style={{ padding: "96px 20px" }} role="alert">
        <div className="big" aria-hidden="true">!</div>
        <h1>That page hit a rough patch</h1>
        <p>Try refreshing the page. Your account and marketplace data are safe.</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Refresh OjaX
        </button>
      </main>
    );
  }
}
