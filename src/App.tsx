import { Suspense, lazy } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

const Signup = lazy(() => import("./pages/signup"));
const Login = lazy(() => import("./pages/login"));
const Home = lazy(() => import("./pages/home"));

export default function App() {
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
        path: "/",
        element: <Home/>
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