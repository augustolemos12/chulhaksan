import { Link } from 'react-router-dom';

export function Home() {
  const socialLinks = [
    {
      name: 'WhatsApp',
      href: 'https://wa.me/5492612793740',
      icon: 'chat',
    },
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/share/1DhjYkWfU9/?mibextid=wwXIfr',
      icon: 'thumb_up',
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/chulhaksan.mendoza',
      icon: 'photo_camera',
    },
  ];

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden pb-10 bg-background-light text-[#1b0d0d] antialiased">
      <header className="sticky top-0 z-50 flex items-center bg-background-light/95 backdrop-blur-md px-4 py-3 justify-between border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img
            alt="Chul Hak San"
            className="h-9 w-9 rounded-full bg-white p-0.5 shadow-sm"
            src="/assets/logo-color.png"
          />
          <span className="text-[10px] font-bold text-primary tracking-[0.4em] uppercase">
            CHS
          </span>
        </div>
        <div className="size-10" />
      </header>

      <div className="@container">
        <div className="@[480px]:px-4 @[480px]:py-4">
          <div className="flex flex-col justify-center items-center overflow-hidden bg-gray-900 @[480px]:rounded-2xl min-h-[480px] shadow-2xl relative text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2b0f0f] via-[#160b0b] to-black opacity-95" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_80%_15%,rgba(236,19,19,0.2),transparent_50%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.05),transparent_45%)]" />
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(120deg,rgba(255,255,255,0.05)_0%,transparent_35%,rgba(236,19,19,0.08)_70%,transparent_100%)]" />
            <div className="z-10 px-6 flex flex-col items-center">
              <div className="mb-6 rounded-full p-1 shadow-[0_0_20px_rgba(236,19,19,0.2)]">
                <img
                  alt="Chul Hak San Logo"
                  className="w-32 h-32 object-contain rounded-full bg-white p-1"
                  src="/assets/logo-color.png"
                />
              </div>
              <h1 className="text-white text-3xl font-extrabold leading-tight tracking-tight text-shadow-hero mb-2 uppercase">
                Chul Hak San
              </h1>
              <p className="text-white text-lg font-medium italic opacity-90 text-shadow-hero">
                Una Filosofía de Vida
              </p>
              <Link
                className="mt-6 w-full max-w-[220px] bg-primary hover:bg-accent text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
                to="/login"
              >
                <span>Iniciar Sesión</span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
              <div className="w-20 h-[3px] bg-primary mt-5 rounded-full" />
              <p className="mt-4 text-[11px] uppercase tracking-[0.45em] text-white/70">
                FORMAMOS PERSONAS CAPACES DE ALCANZAR EL ÉXITO Y LA FELICIDAD
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="material-symbols-outlined text-primary">
                visibility
              </span>
              <h2 className="text-lg font-bold">Nuestra Visión</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              • Ser la organizacion N°1 del mundo en la enseñanza de Taekwon-do a todas las personas, sin distinción de sexo, raza, credo, religión y cultura.
              Mejorando la calidad de vida y elevando el potencial humano, en un espacio cordial, ético y confiable.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="material-symbols-outlined text-primary">
                groups
              </span>
              <h2 className="text-lg font-bold">Nuestra Misión</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              • Facultar lideres capaces de trascender y hacer trascender a su gente.
              <br />
              • Forjar un equipo de trabajo sólido y edicaz basado en la confiabilidad.
            </p>
          </div>
        </div>
      </section>

      <section className="relative py-12 px-4 bg-white overflow-hidden">
        <div className="text-center mb-10 relative z-10">
          <h2 className="text-2xl font-extrabold mb-2 tracking-tight">
            Principios del Taekwon-Do
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto relative z-10">
          <div className="bg-white p-5 rounded-2xl border border-primary/40 shadow-soft-red transition-all duration-300 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-primary text-2xl">
                front_hand
              </span>
            </div>
            <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide">
              Cortesía
            </h4>
            <p className="text-[10px] text-primary font-semibold italic mt-0.5 tracking-wider">
              Ye Ui
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-primary/40 shadow-soft-red transition-all duration-300 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-primary text-2xl">
                verified_user
              </span>
            </div>
            <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide">
              Integridad
            </h4>
            <p className="text-[10px] text-primary font-semibold italic mt-0.5 tracking-wider">
              Yom Chi
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-primary/40 shadow-soft-red transition-all duration-300 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-primary text-2xl">
                speed
              </span>
            </div>
            <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide">
              Perseverancia
            </h4>
            <p className="text-[10px] text-primary font-semibold italic mt-0.5 tracking-wider">
              In Nae
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-primary/40 shadow-soft-red transition-all duration-300 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-primary text-2xl">
                psychology
              </span>
            </div>
            <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide">
              Autocontrol
            </h4>
            <p className="text-[10px] text-primary font-semibold italic mt-0.5 tracking-wider">
              Guk Gi
            </p>
          </div>
          <div className="col-span-2 bg-white p-5 rounded-2xl border border-primary/40 shadow-soft-red transition-all duration-300 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-primary text-2xl">
                bolt
              </span>
            </div>
            <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide">
              Espíritu Indomable
            </h4>
            <p className="text-[10px] text-primary font-semibold italic mt-0.5 tracking-wider">
              Baekjul Boolgool
            </p>
          </div>
        </div>
        <div className="mt-12 rounded-3xl border border-gray-100 bg-gradient-to-br from-white to-[#fdf4f4] p-6 shadow-soft-red">
          <div className="flex flex-col items-center gap-6 text-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-primary">
                Filosofía Chul Hak San
              </p>
              <h3 className="mt-2 text-xl font-extrabold">Valores Fundamentales</h3>
            </div>
            <div className="w-full rounded-2xl bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
              <img
                src="/assets/filosofia.png"
                alt="Filosofía Chul Hak San"
                className="mx-auto w-full max-w-[320px]"
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-gray-200 bg-[#140909] px-4 py-8 text-white">
        <div className="mx-auto w-full max-w-md sm:max-w-lg md:max-w-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                Chul Hak San
              </p>
              <p className="mt-1 text-sm text-white/80">
                Seguinos en redes sociales
              </p>
            </div>
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.name}
                  title={social.name}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-white"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {social.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
