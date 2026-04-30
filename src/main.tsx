import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { store } from "./store";
import { queryClient } from "./config/queryClient";
import App from "./App";
import "./index.css";
import { registerServiceWorker } from "./utils/registerServiceWorker";
import ThemeWrapper from "./ThemeWrapper";
import ErrorBoundary from "./components/common/ErrorBoundary";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found");
}

ReactDOM.createRoot(rootEl).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <ThemeWrapper>
            <App />
          </ThemeWrapper>
        </ErrorBoundary>
        {/* React Query Devtools - only visible in development */}
        <ReactQueryDevtools initialIsOpen={false} />
      </BrowserRouter>
    </QueryClientProvider>
  </Provider>
);

// ============================================
// DEMO MODE: Suppress known third-party library warnings
// ============================================
// NOTE: Commented out temporarily to avoid interfering with React initialization
// TODO: Re-enable after fixing all hook errors
// if (import.meta.env.DEV) {
//   setTimeout(() => {
//     const originalWarn = console.warn;
//     console.warn = (...args: any[]) => {
//       const message = args[0]?.toString?.() ?? "";

//       if (
//         message.includes("findDOMNode") ||
//         message.includes("[antd:") ||
//         message.includes("React Router Future Flag") ||
//         (message.includes("children") && message.includes("deprecated")) ||
//         message.includes("Static function can not consume context")
//       ) {
//         return;
//       }

//       originalWarn(...args);
//     };
//   }, 0);
// }

// Register service worker for PWA support (prod only to avoid dev cache issues)
if (import.meta.env.PROD) {
  registerServiceWorker();
}
