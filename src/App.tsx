import SidebarMenu from "./components/custom/sidebar";
import { Suspense, lazy, useContext } from "react";
import { Navigate, Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import ThemeProvider from "./contexts/themeContext";
import { LayoutDashboard, LayoutList, Group } from "lucide-react";
import { AuthContext } from "./contexts/authContext";
import AuthProvider from "./contexts/authContext";
import { Toaster } from "@/components/ui/sonner";
import PersistenceProvider from "./contexts/persistenceContext";
import SessionError from "./pages/sessionerror";
import Loader from "./components/custom/loader";

const Signup = lazy(() => import("./pages/signup"));
const Login = lazy(() => import("./pages/login"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const Collections = lazy(() => import("./pages/collections"));
const AllTests = lazy(() => import("./components/custom/tests"));
const Profile = lazy(() => import("./pages/profile"));
const Help = lazy(() => import("./pages/help"));
const Reports = lazy(() => import("./components/custom/reports"));
const Scripts = lazy(() => import("./pages/scripts"));
const ScriptTests = lazy(() => import("./pages/scriptTests"));
const ReportPage = lazy(() => import("./pages/report-page"));

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
      <Suspense fallback={<Loader/>}>
        <div className="flex-shrink-1 w-full xl:mx-40 lg:mx-20 overflow-y-auto">
          <div className="p-5 w-full overflow-y-auto">
            <PersistenceProvider>
              <Outlet/>
            </PersistenceProvider>
          </div>
        </div>
      </Suspense>
    </SidebarMenu>
  );
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loggedIn } = useContext(AuthContext);

  if (loggedIn === null) {
    return null
  }

  return loggedIn === true ? children : <Navigate to="/login" />;
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
        element: <ProtectedRoute><Layout/></ProtectedRoute>,
        children: [
            { path: "/", element:<Navigate to="/home"/>},
            { path: "/home", element: <Dashboard/> },
            { path: "/collections", element: <Collections/>},
            { path: "/collections/:collectionId/:collectionName", element: <Scripts /> },
            { path: "/collections/:collectionId/:collectionName/:scriptId/:scriptName", element: <ScriptTests /> },
            { path: "/collections/:collectionId/:collectionName/:scriptId/:scriptName/:testId", element: <ReportPage /> },
            { path: "/tests", element: <AllTests onRowRedirect={(row) => (`/tests/reports/${row.testId}`)}/> },
            { path: "/profile", element: <Profile/> },
            { path: "/help", element: <Help/>},
            { path: "/tests/reports/:testId", element: <Reports /> }
        ]
    },
    {
      path: "/sessionerror",
      element: <SessionError/>
    },
    {
        path: "*",
        element: <ProtectedRoute><Navigate to="/home" /></ProtectedRoute>
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