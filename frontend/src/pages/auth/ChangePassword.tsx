import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, fetchMe } from './auth';

export function ChangePassword() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        if (password.trim().length < 6) {
            setError('La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (password !== confirm) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        setSaving(true);
        try {
            const response = await apiFetch('/auth/change-password', {
                method: 'POST',
                json: true,
                body: JSON.stringify({ newPassword: password.trim() }),
            });
            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.message ?? 'No se pudo cambiar la contraseña.');
            }
            await fetchMe();
            navigate('/dashboard');
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'No se pudo cambiar la contraseña.';
            setError(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light text-[#1b0d0d] flex flex-col items-center px-6">
            <div className="w-full max-w-sm sm:max-w-md mt-16">
                <h2 className="text-2xl font-bold tracking-tight text-center">
                    Actualizá tu contraseña
                </h2>
                <p className="text-sm text-gray-500 mt-2 text-center">
                    Por seguridad, necesitás definir una nueva contraseña para continuar.
                </p>
            </div>

            <form
                className="w-full max-w-sm sm:max-w-md mt-8 space-y-4"
                onSubmit={handleSubmit}
            >
                <div className="flex flex-col">
                    <label className="text-xs font-bold uppercase tracking-[0.05em] mb-2 ml-1 text-[#1a1a2e] opacity-80">
                        Nueva contraseña
                    </label>
                    <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-4 text-slate-400">
                            lock
                        </span>
                        <input
                            className="form-input flex w-full rounded-xl text-[#1a1a2e] border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary h-[52px] placeholder:text-slate-300 pl-12 pr-12 text-base font-normal transition-all shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]"
                            placeholder="••••••••"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                        <button
                            className="absolute right-4 text-slate-400 hover:text-[#1a1a2e] transition-colors"
                            type="button"
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            <span className="material-symbols-outlined text-xl">
                                {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className="text-xs font-bold uppercase tracking-[0.05em] mb-2 ml-1 text-[#1a1a2e] opacity-80">
                        Confirmar contraseña
                    </label>
                    <input
                        className="form-input flex w-full rounded-xl text-[#1a1a2e] border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary h-[52px] placeholder:text-slate-300 px-4 text-base font-normal transition-all shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]"
                        placeholder="••••••••"
                        type="password"
                        value={confirm}
                        onChange={(event) => setConfirm(event.target.value)}
                        required
                    />
                </div>

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <button
                    className="w-full h-[52px] bg-primary text-white font-bold text-base rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-70"
                    type="submit"
                    disabled={saving}
                >
                    {saving ? 'Guardando...' : 'Actualizar contraseña'}
                </button>
            </form>
        </div>
    );
}
