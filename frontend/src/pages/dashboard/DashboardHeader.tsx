import { useTheme } from '../../contexts/ThemeContext';

type DashboardHeaderProps = {
  title?: string;
  onLogout: () => void;
};

export function DashboardHeader({ title = 'Chul Hak San', onLogout }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="w-full top-0 sticky bg-surface shadow-soft z-50 transition-colors duration-300">
      <div className="flex justify-between items-center px-6 h-16 w-full max-w-[1200px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined">sports_martial_arts</span>
          </div>
          <h1 className="font-display text-xl font-bold text-primary tracking-tight">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="text-muted hover:text-text transition-colors active:scale-95 flex items-center justify-center p-2 rounded-full hover:bg-black/5 dark:hover:bg-surface/10"
            title="Alternar tema"
          >
            <span className="material-symbols-outlined">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
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
