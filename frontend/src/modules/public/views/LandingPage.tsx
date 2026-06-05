import { Link } from 'react-router-dom';
import logoColor from '../../../assets/logo-fotor-2026052717752.png';
import logoNavbar from '../../../assets/logo-fotor-2026052717752.png';
import filosofiaImg from '../../../assets/filosofia.png';
import { useAppTheme } from '../../../core/theme/ThemeProvider';

const TENETS = [
  { label: 'Cortesía', korean: 'Ye Ui', icon: 'front_hand' },
  { label: 'Integridad', korean: 'Yom Chi', icon: 'verified_user' },
  { label: 'Perseverancia', korean: 'In Nae', icon: 'speed' },
  { label: 'Autocontrol', korean: 'Guk Gi', icon: 'psychology' },
  { label: 'Espíritu Indomable', korean: 'Baekjul Boolgool', icon: 'bolt', colSpan: 2 },
];

function TopNavigation() {
  const { theme, changeTheme } = useAppTheme();
  const handleToggleTheme = () => changeTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <header className="sticky top-0 z-50 flex items-center bg-surface/95 backdrop-blur-md px-4 py-3 justify-between border-b border-border">
      <div className="flex items-center gap-3">
        <img alt="Chul Hak San" className="h-9 w-9 rounded-full bg-surface p-0.5 shadow-soft" src={logoNavbar} />
        <span className="text-[10px] font-bold text-primary tracking-[0.4em] uppercase">CHS</span>
      </div>
      <div>
        <button
          onClick={handleToggleTheme}
          className="text-muted hover:text-text transition-colors active:scale-95 flex items-center justify-center p-2 rounded-full hover:bg-black/5 dark:hover:bg-surface/10"
          title="Alternar tema"
        >
          <span className="material-symbols-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
        </button>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <div className="@container">
      <div className="@[480px]:px-4 @[480px]:py-4">
        <div className="flex flex-col justify-center items-center overflow-hidden bg-gray-900 @[480px]:rounded-2xl min-h-[480px] shadow-2xl relative text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2b0f0f] via-[#160b0b] to-black opacity-95" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_80%_15%,rgba(236,19,19,0.2),transparent_50%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.05),transparent_45%)]" />
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(120deg,rgba(255,255,255,0.05)_0%,transparent_35%,rgba(236,19,19,0.08)_70%,transparent_100%)]" />
          <div className="z-10 px-6 flex flex-col items-center">
            <div className="mb-6 rounded-full p-1 shadow-[0_0_20px_rgba(236,19,19,0.2)]">
              <img alt="Chul Hak San Logo" className="w-32 h-32 object-contain rounded-full bg-surface p-1" src={logoColor} />
            </div>
            <h1 className="text-white text-3xl font-extrabold leading-tight tracking-tight text-shadow-hero mb-2 uppercase">
              Chul Hak San
            </h1>
            <p className="text-white text-lg font-medium italic opacity-90 text-shadow-hero">Una Filosofía de Vida</p>
            <Link
              className="mt-6 w-full max-w-[220px] bg-gradient-to-r from-primary to-accent text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group"
              to="/login"
            >
              <span>Iniciar Sesión</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
            <div className="w-20 h-[3px] bg-primary mt-5 rounded-full" />
            <p className="mt-4 text-[11px] uppercase tracking-[0.45em] text-white/70">
              FORMAMOS PERSONAS CAPACES DE ALCANZAR EL ÉXITO Y LA FELICIDAD
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function VisionMissionSection() {
  return (
    <section className="px-4 py-8 space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-soft">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary">visibility</span>
            <h2 className="text-lg font-bold">Nuestra Visión</h2>
          </div>
          <p className="text-sm text-muted leading-relaxed font-medium">
            Ser la organizacion N°1 del mundo en la enseñanza de Taekwon-do a todas las personas, sin distinción de sexo, raza, credo, religión y cultura. Mejorando la calidad de vida y elevando el potencial humano, en un espacio cordial, ético y confiable.
          </p>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-soft">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary">groups</span>
            <h2 className="text-lg font-bold">Nuestra Misión</h2>
          </div>
          <p className="text-sm text-muted leading-relaxed font-medium">
            • Facultar lideres capaces de trascender y hacer trascender a su gente.
            <br />
            • Forjar un equipo de trabajo sólido y eficaz basado en la confiabilidad.
          </p>
        </div>
      </div>
    </section>
  );
}

function TenetsSection() {
  return (
    <section className="relative py-12 px-4 bg-background overflow-hidden">
      <div className="text-center mb-10 relative z-10">
        <h2 className="text-2xl font-extrabold mb-2 tracking-tight">Principios del Taekwon-Do</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto relative z-10">
        {TENETS.map((tenet, idx) => (
          <div
            key={idx}
            className={`${tenet.colSpan ? 'col-span-2' : ''} bg-surface p-4 sm:p-5 rounded-2xl border border-primary/40 shadow-soft transition-all duration-300 flex flex-col items-center text-center hover:border-primary/70 hover:shadow-glow/10`}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-primary text-2xl">{tenet.icon}</span>
            </div>
            <h4 className="font-bold text-sm text-text uppercase tracking-wide">{tenet.label}</h4>
            <p className="text-[10px] text-primary font-semibold italic mt-0.5 tracking-wider">{tenet.korean}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <div className="flex flex-col items-center gap-6 text-center">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-primary">Filosofía Chul Hak San</p>
            <h3 className="mt-2 text-xl font-extrabold">Valores Fundamentales</h3>
          </div>
          <div className="w-full rounded-2xl bg-surface p-4 shadow-soft">
            <img src={filosofiaImg} alt="Filosofía Chul Hak San" className="mx-auto w-full max-w-[320px]" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden pb-10 bg-background text-text antialiased transition-colors duration-300">
      <TopNavigation />
      <HeroSection />
      <VisionMissionSection />
      <TenetsSection />
    </div>
  );
}
