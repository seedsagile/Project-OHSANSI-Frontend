import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
} from "react-router-dom";
import { RootLayout } from "../components/layout/RootLayout";
import { PaginaImportarCompetidores } from "../features/inscritos/routes/PaginaImportarCompetidores";
import { PaginaAsignarResponsable } from "../features/responsables/routes/PaginaAsignarResponsable";
import { PaginaAreas } from "../features/areas/rutas/PaginaAreas";

const Dashboard = () => (
    <div className="p-8">
        <h1 className="text-4xl font-bold text-neutro-800">Dashboard</h1>
        <p className="mt-2 text-neutro-600">Bienvenido al panel de administración de la Olimpiada Oh! SanSi.</p>
    </div>
);

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="/dashboard" replace />,
            },
            {
                path: "dashboard",
                element: <Dashboard />,
            },
            {
                path: "competidores",
                element: <PaginaImportarCompetidores />,
            },
            {
                path: "responsables",
                element: <PaginaAsignarResponsable />,
            },
            {
                path: "evaluadores",
                element: <Dashboard />, // <== pones qui tu ruta
            },
            {
                path: "areasNives",
                element: <PaginaAreas />, // <== pones qui tu ruta
            },
            {
                path: "parametrosCalificaciones",
                element: <Dashboard />, // <== pones qui tu ruta
            },
            {
                path: "calificaciones",
                element: <PaginaAsignarResponsable />, // <== pones qui tu ruta
            },
            {
                path: "reportes",
                element: <Dashboard />, // <== pones qui tu ruta
            }
        ],
    },
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;