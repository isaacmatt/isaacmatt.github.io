import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Without a boundary, any error thrown during render or commit (including in a
// useEffect, e.g. WebGL failing to initialize) unmounts the entire root and
// leaves a blank page. Catch it here so the rest of the app keeps working.
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('App error caught by boundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: '#d5dbe4', textAlign: 'center' }}>
          <h1>Matthew Isaac</h1>
          <p>Something went wrong loading the interactive view. Please refresh.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

// react-snap pre-renders each route to static HTML at build time. When that
// HTML is already in #root, hydrate it; otherwise (normal dev / first load)
// create a fresh root and render.
const tree = (
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

if (rootElement.hasChildNodes()) {
  ReactDOM.hydrateRoot(rootElement, tree);
} else {
  ReactDOM.createRoot(rootElement).render(tree);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
