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
    role,
    pageTitle,
    displayName,
    teacherSummary,
    adminStats,
    mpConnected,
    mpMessage,
    monthEvent,
    executeLogout,
    connectMercadoPago,
    disconnectMercadoPago,
  } = useDashboardData();

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

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8">
                <ContentCard className="h-full bg-gradient-to-br from-primary to-[#a81c00] text-white border-none relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-surface/10 rounded-full -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="relative z-10 flex flex-col justify-between h-full min-h-[200px]">
                    <div>
                      <span className="inline-block px-3 py-1 bg-surface/20 rounded-full text-xs font-bold mb-4 backdrop-blur-sm uppercase tracking-wider">
                        Tu Profesor
                      </span>
                      <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">
                        {teacherSummary ? `Prof. ${teacherSummary.firstName} ${teacherSummary.lastName}` : 'Sin profesor asignado'}
                      </h3>
                      <p className="text-white/80 mb-6 flex items-center gap-2 font-medium">
                        <span className="material-symbols-outlined text-sm">info</span>
                        Contacta a tu instructor para tu próxima clase
                      </p>
                    </div>
                    <div>
                      <button className="bg-surface text-primary px-6 py-2.5 rounded-full font-bold hover:bg-surface transition-colors shadow-md active:scale-95">
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </ContentCard>
              </div>

              <div className="md:col-span-4">
                <ContentCard className="h-full p-4 flex flex-col justify-center">
                  <BlockTitle title="Acceso Rápido" subtitle="Herramientas principales" />
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <QuickAction to="/pagos" icon="payments" title="Pagos" />
                    <QuickAction to="/asistencia" icon="checklist" title="Asist." />
                    <QuickAction to="/alumno/formas" icon="link" title="Formas" />
                    <QuickAction to="/perfil" icon="person" title="Perfil" />
                  </div>
                </ContentCard>
              </div>
            </div>
          </div>
        )}

        {role === 'TEACHER' && (
          <ContentCard>
            <BlockTitle title="Acceso rápido" subtitle="Gestión del profesor" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <QuickAction to="/profesor/alumnos" icon="group" title="Alumnos" subtitle="Listado y estado" />
              <QuickAction to="/profesor/gimnasios" icon="folder" title="Gimnasios" subtitle="Carpetas y conteos" />
              <QuickAction to="/alumno/perfil" icon="badge" title="Perfil" subtitle="Datos personales" />
              <QuickAction to="/profesor/datos-de-pago" icon="qr_code_2" title="Datos de Pago" subtitle="Cargar QR y billetera virtual" />
              <QuickAction icon="payments" title="Mercado Pago" subtitle="Cobros en tu cuenta">
                <button
                  className={`mt-4 w-full rounded-xl text-white text-sm font-semibold py-2 ${mpConnected ? 'bg-success' : 'bg-primary'}`}
                  type="button"
                  onClick={mpConnected ? disconnectMercadoPago : connectMercadoPago}
                >
                  {mpConnected ? 'Desconectar' : 'Conectar'}
                </button>
                {mpMessage && <p className="text-xs text-muted mt-2">{mpMessage}</p>}
              </QuickAction>
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
              <div className="flex flex-col gap-3">
                <QuickAction to="/admin/alumnos" icon="group" title="Alumnos" subtitle="Gestión total" variant="row" />
                <QuickAction to="/admin/profesores" icon="badge" title="Profesores" subtitle="Gestión total" variant="row" />
                <QuickAction to="/admin/formas" icon="link" title="Formas" subtitle="Links y desbloqueos" variant="row" />
                <QuickAction to="/admin/gimnasios" icon="folder" title="Gimnasios" subtitle="Carpetas y conteos" variant="row" />
              </div>
            </ContentCard>
          </>
        )}
      </main>
      <MobileNavBar />
    </div>
  );
}
