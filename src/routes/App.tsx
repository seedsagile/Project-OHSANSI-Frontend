import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LoginForm } from '@/auth/login/components/auth/LoginForm';
import { ProtectedRoute } from '@/auth/login/components/auth/ProtectedRoute';
import { useAuth } from '@/auth/login/hooks/useAuth';
import { RootLayout } from '@/components/layout/RootLayout';
import { SystemGuard } from '@/features/sistema/components/SystemGuard';
import { CronogramaGuard } from '@/features/cronograma/components/CronogramaGuard';
import { Dashboard } from '@/features/dashboard/components/Dashboard';
import { PaginaCronograma } from '@/features/cronograma/routes/PaginaCronograma';
import { PaginaConfiguracionFases } from '@/features/ConfiguracionFases/routes/PaginaConfiguracionFases';
import { PaginaRegistrarEvaluador } from '@/features/usuarios/evaluadores/routes/PaginaRegistrarEvaluador';
import { PaginaRegistrarResponsable } from '@/features/usuarios/responsables/routes/PaginaRegistrarResponsable';
import { PaginaAreas } from '@/features/areas/routes/PaginaAreas';
import { PaginaNiveles } from '@/features/niveles/routes/PaginaNiveles';
import { PaginaAsignarNiveles } from '@/features/asignaciones/routes/PaginaAsignarNiveles';
import { PaginaCompetencias } from '@/features/competencias/routes/PaginaCompetencias';
import { PaginaImportarCompetidores } from '@/features/inscritos/routes/PaginaImportarCompetidores';
import { ListaCompetidores } from '@/features/listaCompetidores/components/ListaCompetidores';
import { PaginaExamenes } from '@/features/examenes/routes/PaginaExamenes';
import { PaginaEvaluacionSala } from '@/features/evaluaciones/routes/PaginaEvaluacionSala';
import { Parametro } from '@/features/parametros/components/Parametro';
import { PaginaMedallero } from '@/features/medallero/routes/PaginaMedallero';
import { PaginaReporteCambios } from '@/features/reportes/cambiosCalificaciones/routes/PaginaReporteCambios';

const PublicLoginRoute = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LoginForm />;
};

export default function App() {
  return (
    <BrowserRouter>
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
            <Route path="areas" element={<PaginaAreas />} />
            <Route path="niveles" element={<PaginaNiveles />} />
            <Route path="asignarNiveles" element={<PaginaAsignarNiveles />} />
            <Route path="responsables" element={<PaginaRegistrarResponsable />} />
            <Route path="evaluadores" element={<PaginaRegistrarEvaluador />} />
            <Route path="competidores" element={<PaginaImportarCompetidores />} />
            <Route path="listaCompetidores" element={<ListaCompetidores />} />
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
    </BrowserRouter>
  );
}