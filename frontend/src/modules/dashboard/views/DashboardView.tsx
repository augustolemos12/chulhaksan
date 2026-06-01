import { useDashboardData } from '../hooks/useDashboardData';
import {
  DashboardHeader,
  ProfileGreeting,
  ContentCard,
  BlockTitle,
  MetricCard,
  QuickAction,
} from '../components/DashboardUI';
import { MobileNavBar } from '../../../shared/components/MobileNavBar';

export function DashboardView() {
  const {
    profile,
    isLoadingProfile,
    role,
    pageTitle,
    displayName,
    teacherSummary,
    adminStats,
    monthEvent,
    executeLogout,
  } = useDashboardData();

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-muted font-medium">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <DashboardHeader title={pageTitle} onLogout={executeLogout} />

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-28 md:pb-8 space-y-6">
        <ProfileGreeting profile={profile} displayName={displayName} />

        {role === 'STUDENT' && (
          <div className="flex flex-col gap-6">
            {/* Evento del Mes Section */}
            {monthEvent && (
              <div className="overflow-hidden rounded-3xl relative group shadow-md w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none transition-opacity duration-300 group-hover:from-black/90"></div>
                <img 
                  src={monthEvent.imageUrl} 
                  alt={monthEvent.title} 
                  className="w-full h-48 md:h-64 object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 p-5 md:p-6 z-20 w-full flex flex-col justify-end gap-2">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-white rounded-full text-xs font-bold mb-2 uppercase tracking-wider shadow-sm">
                      Evento del Mes
                    </span>
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-md">
                      {monthEvent.title}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <ContentCard className="bg-gradient-to-br from-primary to-[#a81c00] text-white border-none relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-surface/10 rounded-full -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative z-10 p-2">
                <span className="inline-block px-3 py-1 bg-surface/20 rounded-full text-xs font-bold mb-3 backdrop-blur-sm uppercase tracking-wider">
                  Tu Profesor
                </span>
                <h3 className="font-display text-xl md:text-2xl font-bold mb-1">
                  {teacherSummary ? `Prof. ${teacherSummary.firstName} ${teacherSummary.lastName}` : 'Sin profesor asignado'}
                </h3>
                <p className="text-white/80 flex items-center gap-2 text-sm font-medium">
                  <span className="material-symbols-outlined text-sm">info</span>
                  Contacta a tu instructor para tu próxima clase
                </p>
              </div>
            </ContentCard>

            <ContentCard>
              <BlockTitle title="Acceso Rápido" subtitle="Herramientas principales" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <QuickAction to="/pagos" icon="payments" title="Pagos" />
                <QuickAction to="/alumno/asistencia" icon="checklist" title="Asistencia" />
                <QuickAction to="/alumno/formas" icon="link" title="Formas" />
                <QuickAction to="/perfil" icon="person" title="Perfil" />
              </div>
            </ContentCard>
          </div>
        )}

        {role === 'TEACHER' && (
          <ContentCard>
            <BlockTitle title="Acceso rápido" subtitle="Gestión del profesor" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <QuickAction to="/profesor/alumnos" icon="group" title="Alumnos" subtitle="Listado y estado" variant="row" />
              <QuickAction to="/profesor/censo" icon="pie_chart" title="Censo de Alumnos" subtitle="Métricas y estadísticas" variant="row" />
              <QuickAction to="/profesor/comisiones" icon="class" title="Comisiones" subtitle="Horarios y alumnos" variant="row" />
              <QuickAction to="/profesor/planes" icon="calendar_month" title="Planes de Clases" subtitle="Clases esperadas por mes" variant="row" />
              <QuickAction to="/profesor/datos-de-pago" icon="qr_code_2" title="Datos de Pago" subtitle="Cargar QR y billetera virtual" variant="row" />
              <QuickAction to="/profesor/cuotas" icon="receipt_long" title="Cuotas" subtitle="Administrar pagos de alumnos" variant="row" />
            </div>
          </ContentCard>
        )}

        {role === 'ADMIN' && (
          <>
            <ContentCard>
              <BlockTitle eyebrow="Totales" title="Resumen general" subtitle="Información rápida" />
              <div className="grid grid-cols-2 gap-3">
                <MetricCard label="Alumnos" value={adminStats.students} icon="group" />
                <MetricCard label="Profesores" value={adminStats.teachers} icon="badge" />
              </div>
            </ContentCard>

            <ContentCard>
              <BlockTitle title="Acceso rápido" subtitle="Herramientas administrativas" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <QuickAction to="/admin/alumnos" icon="group" title="Alumnos" subtitle="Gestión total" variant="row" />
                <QuickAction to="/admin/censo" icon="pie_chart" title="Censo de Alumnos" subtitle="Métricas y estadísticas" variant="row" />
                <QuickAction to="/admin/profesores" icon="badge" title="Profesores" subtitle="Gestión total" variant="row" />
                <QuickAction to="/admin/comisiones" icon="class" title="Comisiones" subtitle="Horarios y profesores" variant="row" />
                <QuickAction to="/admin/planes" icon="calendar_month" title="Planes de Clases" subtitle="Clases esperadas" variant="row" />
                <QuickAction to="/admin/formas" icon="link" title="Formas" subtitle="Links y desbloqueos" variant="row" />
                <QuickAction to="/admin/gimnasios" icon="folder" title="Gimnasios" subtitle="Carpetas y conteos" variant="row" />
                <QuickAction to="/admin/eventos" icon="event" title="Evento del mes" subtitle="Gestión de banners" variant="row" />
                <QuickAction to="/admin/cuotas" icon="receipt_long" title="Cuotas" subtitle="Administrar pagos de alumnos" variant="row" />
                <QuickAction to="/admin/cuota-global" icon="payments" title="Cuota global" subtitle="Configurar precios" variant="row" />
              </div>
            </ContentCard>
          </>
        )}
      </main>
      <MobileNavBar />
    </div>
  );
}
