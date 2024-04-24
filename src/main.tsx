import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import "./index.scss";

const Signin = lazy(() => import("./pages/signin"));

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Signin/>
    }
  ]);

  return (
    <div className="flex justify-center flex-col min-h-screen">
      <Suspense>
        <RouterProvider router={router} />
      </Suspense>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
