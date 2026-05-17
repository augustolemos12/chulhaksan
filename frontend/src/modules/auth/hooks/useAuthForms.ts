import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import { httpClient } from '../../../core/api/httpClient';

export function useLoginForm() {
  const navigate = useNavigate();
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDniChange = (val: string) => setDni(val.replace(/\D/g, ''));
  const togglePassword = () => setShowPassword((prev) => !prev);

  const submitLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await authService.login(dni.trim(), password);
      const profile = await authService.fetchUserProfile();

      if (response?.mustChangePassword || profile?.mustChangePassword) {
        navigate('/cambiar-contrasena');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    dni,
    password,
    showPassword,
    error,
    isLoading,
    handleDniChange,
    setPassword,
    togglePassword,
    submitLogin,
  };
}

export function useChangePasswordForm() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword((prev) => !prev);

  const submitChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.trim().length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsSaving(true);
    try {
      await httpClient.post('/auth/change-password', { newPassword: password.trim() });
      await authService.fetchUserProfile();
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar la contraseña.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    isSaving,
    showPassword,
    togglePassword,
    submitChangePassword,
  };
}
