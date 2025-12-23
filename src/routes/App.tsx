import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LoginForm } from '@/auth/login/components/auth/LoginForm';
import { ProtectedRoute } from '@/auth/login/components/auth/ProtectedRoute';
import { useAuth } from '@/auth/login/hooks/useAuth';
import { RootLayout } from '@/components/layout/RootLayout';
import { SystemGuard } from '@/features/sistema/components/SystemGuard';
import { CronogramaGuard } from '@/features/cronograma/components/CronogramaGuard';
import { CompetidoresPage } from '@/features/competidores/routes/CompetidoresPage';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

const Dashboard = lazy(() => import('@/features/dashboard/components/Dashboard').then((module) => ({ default: module.Dashboard })));
const PaginaCronograma = lazy(() => import('@/features/cronograma/routes/PaginaCronograma').then((module) => ({ default: module.PaginaCronograma })));
const PaginaConfiguracionFases = lazy(() => import('@/features/ConfiguracionFases/routes/PaginaConfiguracionFases').then((module) => ({ default: module.PaginaConfiguracionFases })));
const PaginaOlimpiada = lazy(() => import('@/features/olimpiada/routes/PaginaOlimpiada').then((module) => ({ default: module.PaginaOlimpiada })));
const PaginaRegistrarEvaluador = lazy(() => import('@/features/usuarios/evaluadores/routes/PaginaRegistrarEvaluador').then((module) => ({ default: module.PaginaRegistrarEvaluador })));
const PaginaRegistrarResponsable = lazy(() => import('@/features/usuarios/responsables/routes/PaginaRegistrarResponsable').then((module) => ({ default: module.PaginaRegistrarResponsable })));
const PaginaAreas = lazy(() => import('@/features/areas/routes/PaginaAreas').then((module) => ({ default: module.PaginaAreas })));
const PaginaNiveles = lazy(() => import('@/features/niveles/routes/PaginaNiveles').then((module) => ({ default: module.PaginaNiveles })));
const PaginaAsignarNiveles = lazy(() => import('@/features/asignaciones/routes/PaginaAsignarNiveles').then((module) => ({ default: module.PaginaAsignarNiveles })));
const PaginaCompetencias = lazy(() => import('@/features/competencias/routes/PaginaCompetencias').then((module) => ({ default: module.PaginaCompetencias })));
const PaginaImportarCompetidores = lazy(() => import('@/features/inscritos/routes/PaginaImportarCompetidores').then((module) => ({ default: module.PaginaImportarCompetidores })));
const PaginaExamenes = lazy(() => import('@/features/examenes/routes/PaginaExamenes').then((module) => ({ default: module.PaginaExamenes })));
const PaginaConfiguracionRoles = lazy(() => import('@/features/ConfiguracionRoles/routes/PaginaConfiguracionRoles').then((module) => ({ default: module.PaginaConfiguracionRoles })));
const PaginaEvaluacionSala = lazy(() => import('@/features/evaluaciones/routes/PaginaEvaluacionSala').then((module) => ({ default: module.PaginaEvaluacionSala })));
const Parametro = lazy(() => import('@/features/parametros/components/Parametro').then((module) => ({ default: module.Parametro })));
const PaginaMedallero = lazy(() => import('@/features/medallero/routes/PaginaMedallero').then((module) => ({ default: module.PaginaMedallero })));
const PaginaReporteCambios = lazy(() => import('@/features/reportes/cambiosCalificaciones/routes/PaginaReporteCambios').then((module) => ({ default: module.PaginaReporteCambios })));

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
                <PermissionGuard requiredPermission="CRONOGRAMA">
                  <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
                    <PaginaCronograma />
                  </div>
                </PermissionGuard>
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
              <Route path="dashboard" element={
                <PermissionGuard requiredPermission="DASHBOARD">
                  <Dashboard />
                </PermissionGuard>
              } />

              <Route path="olimpiada" element={
                <PermissionGuard requiredPermission="OLIMPIADAS">
                  <PaginaOlimpiada />
                </PermissionGuard>
              } />
              
              <Route path="areas" element={
                <PermissionGuard requiredPermission="AREAS">
                  <PaginaAreas />
                </PermissionGuard>
              } />
              
              <Route path="niveles" element={
                <PermissionGuard requiredPermission="NIVELES">
                  <PaginaNiveles />
                </PermissionGuard>
              } />
              
              <Route path="asignarNiveles" element={
                <PermissionGuard requiredPermission="ASIGNACIONES">
                  <PaginaAsignarNiveles />
                </PermissionGuard>
              } />

              <Route path="responsables" element={
                <PermissionGuard requiredPermission="RESPONSABLES">
                  <PaginaRegistrarResponsable />
                </PermissionGuard>
              } />
              
              <Route path="evaluadores" element={
                <PermissionGuard requiredPermission="EVALUADORES">
                  <PaginaRegistrarEvaluador />
                </PermissionGuard>
              } />

              <Route path="competidores" element={
                <PermissionGuard requiredPermission="INSCRIPCION">
                  <PaginaImportarCompetidores />
                </PermissionGuard>
              } />
              
              <Route path="competidoresPage" element={
                <PermissionGuard requiredPermission="COMPETIDORES">
                  <CompetidoresPage />
                </PermissionGuard>
              } />

              <Route path="competencias" element={
                <PermissionGuard requiredPermission="COMPETENCIAS">
                  <PaginaCompetencias />
                </PermissionGuard>
              } />
              
              <Route path="examenes" element={
                <PermissionGuard requiredPermission="EXAMENES">
                  <PaginaExamenes />
                </PermissionGuard>
              } />
              
              <Route path="evaluaciones" element={
                <PermissionGuard requiredPermission="SALA_EVALUACION">
                  <PaginaEvaluacionSala />
                </PermissionGuard>
              } />
              
              <Route path="parametrosCalificaciones" element={
                <PermissionGuard requiredPermission="PARAMETROS">
                  <Parametro />
                </PermissionGuard>
              } />
              
              <Route path="medallero" element={
                <PermissionGuard requiredPermission="MEDALLERO">
                  <PaginaMedallero />
                </PermissionGuard>
              } />

              <Route path="configuracionFasesGlobales" element={
                <PermissionGuard requiredPermission="ACTIVIDADES_FASES">
                  <PaginaConfiguracionFases />
                </PermissionGuard>
              } />
              
              <Route path="permisosRoles" element={
                <PermissionGuard requiredPermission="GESTIONAR_ROLES">
                  <PaginaConfiguracionRoles />
                </PermissionGuard>
              } />
              
              <Route path="cronograma" element={
                <PermissionGuard requiredPermission="CRONOGRAMA">
                  <PaginaCronograma />
                </PermissionGuard>
              } />

              <Route path="reportesCambiosCalificaciones" element={
                <PermissionGuard requiredPermission="REPORTES_CAMBIOS">
                  <PaginaReporteCambios />
                </PermissionGuard>
              } />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}