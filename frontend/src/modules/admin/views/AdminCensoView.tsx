import { Link } from 'react-router-dom';
import { useAdminCenso } from '../hooks/useAdminCenso';

import { MetricCard } from '../../dashboard/components/DashboardUI';

export function AdminCensoView() {
  const {
    data, loading, error,
    categoryFilter, setCategoryFilter,
    beltGroupFilter, setBeltGroupFilter
  } = useAdminCenso();

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center p-4 justify-between w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto">
          <Link className="text-text flex size-10 shrink-0 items-center justify-center" to="/dashboard">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </Link>
          <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
            Censo de Alumnos
          </h1>
        </div>
      </header>

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-24 space-y-6">
        <MetricCard 
          label="Total Alumnos" 
          value={
            loading ? (
              <div className="h-12 w-12 border-4 border-white/20 border-t-white rounded-full animate-spin mt-2"></div>
            ) : (
              data?.total ?? 0
            )
          } 
          icon="groups" 
          gradientClass="from-red-600 to-rose-500" 
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface rounded-2xl border border-border shadow-soft p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">category</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Categoría</p>
                <select className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as any)}>
                  <option value="">Todas</option>
                  <option value="CHILD">Infantil</option>
                  <option value="ADULT">Adulto</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-soft p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">sports_martial_arts</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Cinturones</p>
                <select className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={beltGroupFilter} onChange={(e) => setBeltGroupFilter(e.target.value as any)}>
                  <option value="">Todos</option>
                  <option value="group1">Blancos y puntas amarillas</option>
                  <option value="group2">Amarillo a punta azul</option>
                  <option value="group3">Azul a punta negra</option>
                  <option value="group4">Danes</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-xl text-sm text-red-600 border border-red-200">{error}</div>
        )}

        {!loading && !error && data && (
          <div className="space-y-6">
            <div className="bg-surface rounded-2xl border border-border shadow-soft p-5">
              <h2 className="text-lg font-bold text-text mb-4 border-b border-border pb-2">Por Categoría</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-semibold text-text">Infantil ({data.byCategory.CHILD.count})</span>
                    <span className="text-sm font-bold text-primary">{data.byCategory.CHILD.percentage}%</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${data.byCategory.CHILD.percentage}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-semibold text-text">Adulto ({data.byCategory.ADULT.count})</span>
                    <span className="text-sm font-bold text-primary">{data.byCategory.ADULT.percentage}%</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${data.byCategory.ADULT.percentage}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-2xl border border-border shadow-soft p-5">
              <h2 className="text-lg font-bold text-text mb-4 border-b border-border pb-2">Por Grupos de Cinturón</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-semibold text-text">Blancos y P. Amarillas ({data.byBeltGroup.group1.count})</span>
                    <span className="text-sm font-bold text-primary">{data.byBeltGroup.group1.percentage}%</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${data.byBeltGroup.group1.percentage}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-semibold text-text">Amarillo a P. Azul ({data.byBeltGroup.group2.count})</span>
                    <span className="text-sm font-bold text-primary">{data.byBeltGroup.group2.percentage}%</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${data.byBeltGroup.group2.percentage}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-semibold text-text">Azul a P. Negra ({data.byBeltGroup.group3.count})</span>
                    <span className="text-sm font-bold text-primary">{data.byBeltGroup.group3.percentage}%</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${data.byBeltGroup.group3.percentage}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-semibold text-text">Danes ({data.byBeltGroup.group4.count})</span>
                    <span className="text-sm font-bold text-primary">{data.byBeltGroup.group4.percentage}%</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${data.byBeltGroup.group4.percentage}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
