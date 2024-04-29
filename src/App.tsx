import SidebarMenu from "./components/custom/sidebar";
import { Suspense, lazy } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import SessionProvider from "./contexts/SessionContext";

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
        element: <SidebarMenu isProtected={true}><Home/></SidebarMenu>
    },
    {
        path: "*",
        element: <Login/>
    }
  ]);

  return (
    <div className="flex justify-center flex-col min-h-screen">
      <SessionProvider>
        <Suspense>
          <RouterProvider router={router} />
        </Suspense>
      </SessionProvider>
    </div>
  );
}