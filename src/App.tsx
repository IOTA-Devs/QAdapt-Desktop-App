import SidebarMenu from "./components/custom/sidebar";
import { Suspense, lazy, useContext } from "react";
import { Navigate, Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import ThemeProvider from "./contexts/themeContext";
import { LayoutDashboard, LayoutList, Group } from "lucide-react";
import { AuthContext } from "./contexts/authContext";
import AuthProvider from "./contexts/authContext";
import { Toaster } from "@/components/ui/sonner";

const Signup = lazy(() => import("./pages/signup"));
const Login = lazy(() => import("./pages/login"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const Collections = lazy(() => import("./pages/collections"));
const AllTests = lazy(() => import("./pages/all-tests"));
const Profile = lazy(() => import("./pages/profile"));
const Help = lazy(() => import("./pages/help"));

const items = [
  {
    icon: <LayoutDashboard className="mr-2 h-4 w-4"/>,
    label: "Dashboard",
    link: "/home"
  },
  {
    icon: <Group className="mr-2 h-4 w-4"/>,
    label: "Collections",
    link: "/collections"
  },
  {
    icon: <LayoutList className="mr-2 h-4 w-4"/>,
    label: "Tests",
    link: "/tests"
  }
];

function Layout() {
  return (
    <SidebarMenu items={items}>
      <Suspense>
        <div className="p-5 w-full overflow-y-auto">
          <Outlet/>
        </div>
      </Suspense>
    </SidebarMenu>
  );
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loggedIn } = useContext(AuthContext);

  return loggedIn ? children : <Navigate to="/login"/>;
}

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
        element: <Layout/>,
        children: [
            { path: "/", element:<ProtectedRoute><Navigate to="/home"/></ProtectedRoute>},
            { path: "/home", element: <ProtectedRoute><Dashboard/></ProtectedRoute> },
            { path: "/collections", element: <ProtectedRoute><Collections/></ProtectedRoute>},
            { path: "/tests", element: <ProtectedRoute><AllTests/></ProtectedRoute> },
            { path: "/profile", element: <ProtectedRoute><Profile/></ProtectedRoute> },
            { path: "help", element: <ProtectedRoute><Help/></ProtectedRoute>}
        ]
    },
    {
        path: "*",
        element: <Login/>
    },
  ]);

  return (
    <div className="flex justify-center flex-col min-h-screen">
      <AuthProvider>
        <ThemeProvider>
          <Suspense>
            <RouterProvider router={router} />
          </Suspense>
          <Toaster 
          expand={true} 
          richColors 
          position="top-right" 
          closeButton
          toastOptions={{}}/>
        </ThemeProvider>
      </AuthProvider>
    </div>
  );
}