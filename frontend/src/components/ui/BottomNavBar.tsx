import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

export function BottomNavBar() {
  const location = useLocation();
  const { theme } = useTheme();

  const navItems = [
    { name: 'Inicio', path: '/dashboard', icon: 'home' },
    { name: 'Pagos', path: '/pagos', icon: 'payments' },
    { name: 'Formas', path: '/formas', icon: 'link' },
    { name: 'Perfil', path: '/perfil', icon: 'person' },
  ];

  return (
    <nav className={`
      fixed bottom-0 left-0 w-full z-50 
      md:hidden
      bg-surface/90 backdrop-blur-md border-t border-border
      pb-safe
      transition-colors duration-300
    `}>
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`
                flex flex-col items-center justify-center w-full h-full gap-1
                transition-all duration-300
                ${isActive ? 'text-primary' : 'text-muted hover:text-text'}
              `}
            >
              <div className={`
                flex items-center justify-center rounded-full w-14 h-8 transition-all duration-300
                ${isActive ? 'bg-primary/10 dark:bg-primary/20' : 'bg-transparent'}
              `}>
                <span className={`material-symbols-outlined text-[24px] ${isActive ? 'font-bold' : ''}`}>
                  {item.icon}
                </span>
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
