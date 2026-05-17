import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../auth/api/authService';
import { httpClient } from '../../../core/api/httpClient';

export type StudentData = {
  dni: string;
  gymId?: string | null;
  firstName: string;
  lastName: string;
  category?: 'ADULT' | 'CHILD';
  phone?: string | null;
  guardianPhone?: string | null;
  email?: string | null;
  birthDate?: string | null;
  address?: string | null;
  gym?: string | null;
};

export type GymOption = { id: string; name: string };
export type FormAccessItem = { id: string; title: string; url: string; order: number; unlocked: boolean };
export type FeeItem = { id: string; month: number; year: number; amount: number | string; status: 'PENDING' | 'PAID'; dueDate: string; paidAt?: string | null; lateFeeApplied?: boolean };

export function useStudentDetails() {
  const { dni } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const profile = authService.getCurrentProfile();
  const isTeacher = profile?.role === 'TEACHER';
  const canManageForms = profile?.role === 'TEACHER' || profile?.role === 'ADMIN';

  const returnTo = searchParams.get('returnTo')?.startsWith('/')
    ? searchParams.get('returnTo')!
    : profile?.role === 'ADMIN' ? '/admin/alumnos' : '/profesor/alumnos';

  const [student, setStudent] = useState<StudentData | null>(null);
  const [gyms, setGyms] = useState<GymOption[]>([]);
  const [fees, setFees] = useState<FeeItem[]>([]);
  const [formsAccess, setFormsAccess] = useState<FormAccessItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '', lastName: '', category: 'ADULT' as 'ADULT' | 'CHILD',
    email: '', phone: '', guardianPhone: '', birthDate: '', address: '', gymId: '',
  });

  const [isResettingPass, setIsResettingPass] = useState(false);
  const [resetPassTemp, setResetPassTemp] = useState('');
  const [copiedReset, setCopiedReset] = useState(false);

  const [actionLoading, setActionLoading] = useState<'unassign' | 'delete' | null>(null);
  const [markingFee, setMarkingFee] = useState<string | null>(null);
  const [formsUpdatingId, setFormsUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!dni) {
      setErrorMsg('Iniciá sesión para ver el alumno.');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [studentRes, feesRes] = await Promise.all([
          httpClient.get<StudentData>(`/students/${dni}`),
          httpClient.get<FeeItem[]>(`/fees/student/${dni}`)
        ]);

        setStudent(studentRes);
        setEditForm({
          firstName: studentRes.firstName ?? '', lastName: studentRes.lastName ?? '',
          category: studentRes.category ?? 'ADULT', email: studentRes.email ?? '',
          phone: studentRes.phone ?? '', guardianPhone: studentRes.guardianPhone ?? '',
          birthDate: studentRes.birthDate ? studentRes.birthDate.split('T')[0] : '',
          address: studentRes.address ?? '', gymId: studentRes.gymId ?? '',
        });
        setFees(feesRes ?? []);

        if (canManageForms) {
          const formsRes = await httpClient.get<FormAccessItem[]>(`/forms/student/${dni}`, { cache: 'no-store' });
          setFormsAccess(Array.isArray(formsRes) ? formsRes : []);
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'No se pudo cargar el alumno.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dni, canManageForms]);

  useEffect(() => {
    if (!isTeacher) return;
    const fetchGyms = async () => {
      try {
        const res = await httpClient.get<GymOption[]>('/gyms', { cache: 'no-store' });
        setGyms(Array.isArray(res) ? res : []);
      } catch {
        setGyms([]);
      }
    };
    fetchGyms();
  }, [isTeacher]);

  const toggleEditMode = () => setIsEditing((prev) => !prev);
  const updateEditForm = (field: keyof typeof editForm, value: string) => setEditForm((prev) => ({ ...prev, [field]: value }));

  const markFeeAsPaid = async (feeId: string) => {
    setMarkingFee(feeId);
    setErrorMsg('');
    try {
      await httpClient.request(`/fees/${feeId}/mark-paid`, { method: 'PATCH' });
      setFees((prev) => prev.map((f) => f.id === feeId ? { ...f, status: 'PAID', paidAt: new Date().toISOString() } : f));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo marcar el pago.');
    } finally {
      setMarkingFee(null);
    }
  };

  const saveProfile = async () => {
    if (!dni) return;
    setIsSaving(true);
    setErrorMsg('');
    try {
      const payload = {
        firstName: editForm.firstName.trim() || null, lastName: editForm.lastName.trim() || null,
        category: editForm.category, email: editForm.email.trim() || null,
        phone: editForm.phone.trim() || null, guardianPhone: editForm.guardianPhone.trim() || null,
        birthDate: editForm.birthDate.trim() || null, address: editForm.address.trim() || null,
        gymId: editForm.gymId.trim() || null,
      };
      
      const res = await httpClient.request(`/teachers/me/students/${dni}`, { method: 'PATCH', json: true, body: JSON.stringify(payload) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Error al actualizar alumno');
      }
      const updated = await res.json() as StudentData;
      setStudent(updated);
      setIsEditing(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo actualizar el alumno.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFormAccess = async (formId: string, currentUnlocked: boolean) => {
    if (!dni) return;
    setFormsUpdatingId(formId);
    setErrorMsg('');
    const nextUnlocked = !currentUnlocked;
    setFormsAccess((prev) => prev.map((f) => f.id === formId ? { ...f, unlocked: nextUnlocked } : f));

    try {
      const res = await httpClient.request(`/forms/student/${dni}/access`, { method: 'PATCH', json: true, body: JSON.stringify({ formId, unlocked: nextUnlocked }) });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo actualizar acceso.');
      }
    } catch (err) {
      setFormsAccess((prev) => prev.map((f) => f.id === formId ? { ...f, unlocked: currentUnlocked } : f));
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo actualizar acceso.');
    } finally {
      setFormsUpdatingId(null);
    }
  };

  const resetPassword = async () => {
    if (!dni || !confirm('¿Quieres resetear la contraseña de este alumno?')) return;
    setIsResettingPass(true);
    setErrorMsg('');
    try {
      const data = await httpClient.post<{ temporaryPassword?: string }>(`/teachers/me/students/${dni}/reset-password`, {});
      if (!data.temporaryPassword) throw new Error('No se recibio la contraseña temporal.');
      setResetPassTemp(data.temporaryPassword);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo resetear la contraseña.');
    } finally {
      setIsResettingPass(false);
    }
  };

  const copyResetPassword = async () => {
    if (!resetPassTemp) return;
    try {
      await navigator.clipboard.writeText(resetPassTemp);
      setCopiedReset(true);
      setTimeout(() => setCopiedReset(false), 1500);
    } catch {
      setCopiedReset(false);
    }
  };

  const unassignStudent = async () => {
    if (!dni || !confirm('¿Quieres desasignar este alumno?')) return;
    setActionLoading('unassign');
    try {
      await httpClient.post(`/teachers/me/students/${dni}/unassign`, {});
      navigate(returnTo);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al desasignar.');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteStudent = async () => {
    if (!dni || !confirm('¿Quieres eliminar este alumno? Esta acción no se puede deshacer.')) return;
    setActionLoading('delete');
    try {
      await httpClient.request(`/teachers/me/students/${dni}`, { method: 'DELETE' });
      navigate(returnTo);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al eliminar.');
    } finally {
      setActionLoading(null);
    }
  };

  const studentName = useMemo(() => student ? `${student.firstName} ${student.lastName}` : 'Alumno', [student]);
  const birthDateFormatted = useMemo(() => student?.birthDate ? new Date(student.birthDate).toLocaleDateString('es-AR', { timeZone: 'UTC' }) : '-', [student]);

  return {
    student, studentName, birthDateFormatted, gyms, fees, formsAccess,
    isLoading, errorMsg, isEditing, isSaving, editForm, updateEditForm, toggleEditMode, saveProfile,
    isResettingPass, resetPassTemp, copiedReset, resetPassword, copyResetPassword,
    actionLoading, unassignStudent, deleteStudent,
    markingFee, markFeeAsPaid,
    formsUpdatingId, toggleFormAccess,
    returnTo, canManageForms, isTeacher
  };
}
