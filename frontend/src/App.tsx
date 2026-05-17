import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { AppThemeProvider } from './core/theme/ThemeProvider';

export function App() {
  return (
    <AppThemeProvider defaultTheme="system" storageKey="chulhaksan-theme">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppThemeProvider>
  );
}