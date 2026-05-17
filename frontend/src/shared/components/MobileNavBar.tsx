import { Link, useLocation } from 'react-router-dom';

const NAVIGATION_ITEMS = [
  { label: 'Inicio', path: '/dashboard', icon: 'home' },
  { label: 'Pagos', path: '/pagos', icon: 'payments' },
  { label: 'Formas', path: '/formas', icon: 'link' },
  { label: 'Perfil', path: '/perfil', icon: 'person' },
];

export function MobileNavBar() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-surface/90 backdrop-blur-md border-t border-border pb-safe transition-colors duration-300">
      <div className="flex justify-around items-center h-16 px-2">
        {NAVIGATION_ITEMS.map((navItem) => {
          const isSelected = pathname === navItem.path || (navItem.path !== '/dashboard' && pathname.startsWith(navItem.path));

          return (
            <Link
              key={navItem.label}
              to={navItem.path}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 ${isSelected ? 'text-primary' : 'text-muted hover:text-text'}`}
            >
              <div className={`flex items-center justify-center rounded-full w-14 h-8 transition-all duration-300 ${isSelected ? 'bg-primary/10 dark:bg-primary/20' : 'bg-transparent'}`}>
                <span className={`material-symbols-outlined text-[24px] ${isSelected ? 'font-bold' : ''}`}>
                  {navItem.icon}
                </span>
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${isSelected ? 'font-bold' : ''}`}>
                {navItem.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
