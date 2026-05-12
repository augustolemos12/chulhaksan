import { Link } from 'react-router-dom';

export function ForgotPasswordSuccess() {
  return (
    <div className="min-h-screen bg-background-light text-[#1b0d0d] flex flex-col">
      <header className="sticky top-0 z-20 bg-background-light/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center p-4 justify-between w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto">
          <Link
            className="text-[#1b0d0d] flex size-10 shrink-0 items-center justify-center"
            to="/login"
          >
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </Link>
          <h2 className="text-[#1b0d0d] text-lg font-bold leading-tight tracking-tight flex-1 text-center">
            Enlace enviado
          </h2>
          <div className="flex w-10 items-center justify-end">
            <span className="material-symbols-outlined">mark_email_read</span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto flex-1 p-6 flex flex-col justify-center">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
          <div className="mx-auto size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">
              mail
            </span>
          </div>
          <h3 className="text-xl font-bold mb-2">Revisá tu correo</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Si el DNI coincide con un usuario registrado, vas a recibir un
            enlace para restablecer tu contraseña en unos minutos.
          </p>
          <Link
            className="mt-6 w-full h-[54px] bg-primary text-white font-bold text-base rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            to="/login"
          >
            Volver al inicio
            <span className="material-symbols-outlined text-xl">login</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
