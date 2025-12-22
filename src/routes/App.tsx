import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LoginForm } from '@/auth/login/components/auth/LoginForm';
import { ProtectedRoute } from '@/auth/login/components/auth/ProtectedRoute';
import { useAuth } from '@/auth/login/hooks/useAuth';
import { RootLayout } from '@/components/layout/RootLayout';
import { SystemGuard } from '@/features/sistema/components/SystemGuard';
import { CronogramaGuard } from '@/features/cronograma/components/CronogramaGuard';
import { CompetidoresPage } from '@/features/competidores/routes/CompetidoresPage';
const Dashboard = lazy(() =>
  import('@/features/dashboard/components/Dashboard').then((module) => ({
    default: module.Dashboard,
  }))
);
const PaginaCronograma = lazy(() =>
  import('@/features/cronograma/routes/PaginaCronograma').then((module) => ({
    default: module.PaginaCronograma,
  }))
);
const PaginaConfiguracionFases = lazy(() =>
  import('@/features/ConfiguracionFases/routes/PaginaConfiguracionFases').then((module) => ({
    default: module.PaginaConfiguracionFases,
  }))
);
const PaginaOlimpiada = lazy(() =>
  import('@/features/olimpiada/routes/PaginaOlimpiada').then((module) => ({
    default: module.PaginaOlimpiada,
  }))
);
const PaginaRegistrarEvaluador = lazy(() =>
  import('@/features/usuarios/evaluadores/routes/PaginaRegistrarEvaluador').then((module) => ({
    default: module.PaginaRegistrarEvaluador,
  }))
);
const PaginaRegistrarResponsable = lazy(() =>
  import('@/features/usuarios/responsables/routes/PaginaRegistrarResponsable').then((module) => ({
    default: module.PaginaRegistrarResponsable,
  }))
);
const PaginaAreas = lazy(() =>
  import('@/features/areas/routes/PaginaAreas').then((module) => ({ default: module.PaginaAreas }))
);
const PaginaNiveles = lazy(() =>
  import('@/features/niveles/routes/PaginaNiveles').then((module) => ({
    default: module.PaginaNiveles,
  }))
);
const PaginaAsignarNiveles = lazy(() =>
  import('@/features/asignaciones/routes/PaginaAsignarNiveles').then((module) => ({
    default: module.PaginaAsignarNiveles,
  }))
);
const PaginaCompetencias = lazy(() =>
  import('@/features/competencias/routes/PaginaCompetencias').then((module) => ({
    default: module.PaginaCompetencias,
  }))
);
const PaginaImportarCompetidores = lazy(() =>
  import('@/features/inscritos/routes/PaginaImportarCompetidores').then((module) => ({
    default: module.PaginaImportarCompetidores,
  }))
);
//const ListaCompetidores = lazy(() => import('@/features/listaCompetidores/components/ListaCompetidores').then(module => ({ default: module.ListaCompetidores })));
const PaginaExamenes = lazy(() =>
  import('@/features/examenes/routes/PaginaExamenes').then((module) => ({
    default: module.PaginaExamenes,
  }))
);
const PaginaEvaluacionSala = lazy(() =>
  import('@/features/evaluaciones/routes/PaginaEvaluacionSala').then((module) => ({
    default: module.PaginaEvaluacionSala,
  }))
);
const Parametro = lazy(() =>
  import('@/features/parametros/components/Parametro').then((module) => ({
    default: module.Parametro,
  }))
);
const PaginaMedallero = lazy(() =>
  import('@/features/medallero/routes/PaginaMedallero').then((module) => ({
    default: module.PaginaMedallero,
  }))
);
const PaginaReporteCambios = lazy(() =>
  import('@/features/reportes/cambiosCalificaciones/routes/PaginaReporteCambios').then(
    (module) => ({ default: module.PaginaReporteCambios })
  )
);

const PageLoader = () => (
  <div className="flex h-full w-full items-center justify-center p-10">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-principal-600"></div>
  </div>
);

const PublicLoginRoute = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LoginForm />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<PublicLoginRoute />} />
          <Route
            element={
              <ProtectedRoute>
                <SystemGuard>
                  <Outlet />
                </SystemGuard>
              </ProtectedRoute>
            }
          >
            <Route
              path="configuracionCronograma"
              element={
                <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
                  <PaginaCronograma />
                </div>
              }
            />
            <Route
              element={
                <CronogramaGuard>
                  <RootLayout>
                    <Outlet />
                  </RootLayout>
                </CronogramaGuard>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="olimpiada" element={<PaginaOlimpiada />} />
              <Route path="areas" element={<PaginaAreas />} />
              <Route path="niveles" element={<PaginaNiveles />} />
              <Route path="asignarNiveles" element={<PaginaAsignarNiveles />} />
              <Route path="responsables" element={<PaginaRegistrarResponsable />} />
              <Route path="evaluadores" element={<PaginaRegistrarEvaluador />} />
              <Route path="competidores" element={<PaginaImportarCompetidores />} />
              <Route path="competidoresPage" element={<CompetidoresPage />} />
              <Route path="competencias" element={<PaginaCompetencias />} />
              <Route path="examenes" element={<PaginaExamenes />} />
              <Route path="evaluaciones" element={<PaginaEvaluacionSala />} />
              <Route path="parametrosCalificaciones" element={<Parametro />} />
              <Route path="medallero" element={<PaginaMedallero />} />
              <Route path="configuracionFasesGlobales" element={<PaginaConfiguracionFases />} />
              <Route path="cronograma" element={<PaginaCronograma />} />
              <Route path="reportesCambiosCalificaciones" element={<PaginaReporteCambios />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
