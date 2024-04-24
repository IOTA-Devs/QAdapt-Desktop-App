import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import "./index.scss";

const Signup = lazy(() => import("./pages/signup"));
const Login = lazy(() => import("./pages/login"));

function App() {
  const router = createBrowserRouter([
    {
      path: "/register",
      element: <Signup/>
    },
    {
      path: "/login",
      element: <Login/>
    },
    {
      path: "*",
      element: <Login/>
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
