import { lazy, Suspense } from "react";
import { useRoutes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import PrivateRoute from "./routes/PrivateRoute";
import Loading from "./components/Loading";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Landing = lazy(() => import("./pages/Landing/Landing"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Apostilas = lazy(() => import("./pages/Apostilas"));
const Flashcards = lazy(() => import("./pages/Flashcards"));
const Trilhas = lazy(() => import("./pages/Trilhas"));
const Questoes = lazy(() => import("./pages/Questoes"));
const Provas = lazy(() => import("./pages/Provas"));
const Perfil = lazy(() => import("./pages/Perfil"));
const Admin = lazy(() => import("./pages/Admin"));

export default function App() {
  const routes = useRoutes([
    { path: "/", element: <Landing /> },
    {
      element: <MainLayout />,
      children: [
        { path: "/login", element: <Login /> },
        {
          element: <PrivateRoute />,
          children: [
            { path: "/dashboard", element: <Dashboard /> },
            { path: "/apostilas", element: <Apostilas /> },
            { path: "/flashcards", element: <Flashcards /> },
            { path: "/trilhas", element: <Trilhas /> },
            { path: "/trilhas/:slug", element: <Trilhas /> },
            { path: "/questoes", element: <Questoes /> },
            { path: "/provas", element: <Provas /> },
            { path: "/perfil", element: <Perfil /> }
          ]
        }
      ]
    },
    {
      element: <AdminLayout />,
      children: [
        {
          element: <PrivateRoute requireAdmin />,
          children: [
            { path: "/admin", element: <Admin /> },
            { path: "/admin/*", element: <Admin /> }
          ]
        }
      ]
    }
  ]);

  return <Suspense fallback={<Loading />}>{routes}</Suspense>;
}
