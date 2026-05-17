import { Link } from 'react-router-dom';
import { useAppTheme } from '../../../core/theme/ThemeProvider';
import logoColor from '../../../assets/logo-color.png';
import type { UserProfile } from '../../auth/api/authService';

export function DashboardHeader({ title = 'Chul Hak San', onLogout }: { title?: string; onLogout: () => void }) {
  const { theme, changeTheme } = useAppTheme();
  const toggleTheme = () => changeTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <header className="w-full top-0 sticky bg-surface shadow-soft z-50 transition-colors duration-300">
      <div className="flex justify-between items-center px-6 h-16 w-full max-w-[1200px] mx-auto">
        <div className="flex items-center gap-3">
          <img src={logoColor} alt="Logo" className="w-10 h-10 rounded-full bg-surface p-0.5 shadow-md border border-border" />
          <h1 className="font-display text-xl font-bold text-primary tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="text-muted hover:text-text transition-colors active:scale-95 flex items-center justify-center p-2 rounded-full hover:bg-black/5 dark:hover:bg-surface/10"
            title="Alternar tema"
          >
            <span className="material-symbols-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button
            onClick={onLogout}
            className="text-muted hover:text-danger transition-colors active:scale-95 flex items-center justify-center p-2 rounded-full hover:bg-danger/10"
            title="Cerrar sesión"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export function ProfileGreeting({ profile, displayName }: { profile: UserProfile | null; displayName: string }) {
  const roleName = profile?.role === 'STUDENT' ? 'Alumno' : profile?.role === 'TEACHER' ? 'Profesor' : 'Administrador';

  return (
    <div className="mb-8 mt-2">
      <h2 className="font-display text-2xl md:text-3xl text-text">
        ¡Hola, <span className="text-primary font-bold">{displayName || roleName}</span>!
      </h2>
      <p className="text-muted mt-1 font-medium">
        {profile?.role === 'STUDENT'
          ? 'Tu próximo cinturón te espera. ¡Sigue entrenando!'
          : `Panel de control del ${roleName.toLowerCase()}`}
      </p>
    </div>
  );
}

export function ContentCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-3xl border border-white/40 shadow-soft p-5 ${className}`}>
      {children}
    </div>
  );
}

export function BlockTitle({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      {eyebrow && <p className="text-xs uppercase tracking-widest text-primary font-bold mb-1">{eyebrow}</p>}
      <h2 className="font-display text-xl md:text-2xl font-bold text-text">{title}</h2>
      {subtitle && <p className="text-sm text-muted mt-1 font-medium">{subtitle}</p>}
    </div>
  );
}

export function MetricCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="rounded-2xl bg-background border border-border p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{label}</span>
        <span className="material-symbols-outlined text-primary">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-black text-text">{value}</p>
    </div>
  );
}

export function QuickAction({ to, icon, title, subtitle, children }: { to?: string; icon: string; title: string; subtitle?: string; children?: React.ReactNode }) {
  const content = (
    <div className="group bg-surface rounded-2xl border border-transparent hover:border-primary/20 shadow-soft hover:shadow-md p-6 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer h-full">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <p className="text-sm font-bold text-text uppercase tracking-wide">{title}</p>
      {subtitle && <p className="text-xs font-medium text-muted mt-2">{subtitle}</p>}
      {children}
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}
