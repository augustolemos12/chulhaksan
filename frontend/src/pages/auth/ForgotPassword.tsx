import { Link } from 'react-router-dom';

export function ForgotPassword() {
  return (
    <div className="min-h-screen bg-background-light text-[#1b0d0d]">
      <header className="sticky top-0 z-20 bg-background-light/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center p-4 justify-between w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto">
          <Link
            className="text-[#1b0d0d] flex size-10 shrink-0 items-center justify-center"
            to="/login"
          >
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </Link>
          <h2 className="text-[#1b0d0d] text-lg font-bold leading-tight tracking-tight flex-1 text-center">
            Recuperar contraseña
          </h2>
          <div className="flex w-10 items-center justify-end">
            <span className="material-symbols-outlined">lock_reset</span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-6 space-y-6">
        <section className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-600 leading-relaxed">
            Ingresá tu DNI y te vamos a enviar un enlace para crear una nueva
            contraseña.
          </p>
        </section>

        <section className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col w-full">
              <span className="text-[#1a1a2e] text-[12px] font-bold uppercase tracking-[0.05em] mb-2 ml-1 opacity-80">
                DNI
              </span>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-slate-400">
                  badge
                </span>
                <input
                  className="form-input flex w-full rounded-xl text-[#1a1a2e] border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary h-[58px] placeholder:text-slate-300 pl-12 pr-4 text-base font-normal transition-all shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]"
                  inputMode="numeric"
                  placeholder="Ej: 12345678"
                  type="text"
                />
              </div>
            </label>

            <Link
              className="w-full h-[58px] bg-primary text-white font-bold text-base rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              to="/recuperar/enviado"
            >
              Enviar enlace
              <span className="material-symbols-outlined text-xl">send</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
