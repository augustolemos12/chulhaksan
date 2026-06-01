import { Link } from 'react-router-dom';
import logoColor from '../../../assets/logo-fotor-2026052717752.png';
import logoNavbar from '../../../assets/logo-fotor-2026052717752.png';
import filosofiaImg from '../../../assets/filosofia.png';
import { useAppTheme } from '../../../core/theme/ThemeProvider';

const SOCIAL_LINKS = [
  { name: 'WhatsApp', href: 'https://wa.me/5492612793740' },
  { name: 'Facebook', href: 'https://www.facebook.com/share/1DhjYkWfU9/?mibextid=wwXIfr' },
  { name: 'Instagram', href: 'https://www.instagram.com/chulhaksan.mendoza' },
];

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
            • Ser la organizacion N°1 del mundo en la enseñanza de Taekwon-do a todas las personas, sin distinción de sexo, raza, credo, religión y cultura. Mejorando la calidad de vida y elevando el potencial humano, en un espacio cordial, ético y confiable.
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
            • Forjar un equipo de trabajo sólido y edicaz basado en la confiabilidad.
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto relative z-10">
        {TENETS.map((tenet, idx) => (
          <div
            key={idx}
            className={`${tenet.colSpan ? 'col-span-2' : ''} bg-surface p-5 rounded-2xl border border-primary/40 shadow-soft transition-all duration-300 flex flex-col items-center text-center hover:border-primary/70 hover:shadow-glow/10`}
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

function getSocialIcon(name: string) {
  switch (name) {
    case 'WhatsApp':
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.455h.008c6.55 0 11.885-5.336 11.888-11.893a11.83 11.83 0 00-3.488-8.413" />
        </svg>
      );
    case 'Facebook':
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case 'Instagram':
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    default:
      return null;
  }
}

function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-[#140909] px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-md sm:max-w-lg md:max-w-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Chul Hak San</p>
            <p className="mt-1 text-sm text-white/80">Seguinos en redes sociales</p>
          </div>
          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.name}
                title={social.name}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-surface/5 text-white transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-white"
              >
                {getSocialIcon(social.name)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden pb-10 bg-background text-text antialiased transition-colors duration-300">
      <TopNavigation />
      <HeroSection />
      <VisionMissionSection />
      <TenetsSection />
      <PublicFooter />
    </div>
  );
}
