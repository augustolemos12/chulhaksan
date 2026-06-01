import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../auth/api/authService';
import { httpClient } from '../../../core/api/httpClient';

export type StudentData = {
  id: number;
  dni: string;
  gymId?: string | null;
  firstName: string;
  lastName: string;
  category?: 'ADULT' | 'CHILD';
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  gym?: { id: number; name: string } | null;
  classGroup?: { id: number; name: string } | null;
  currentBelt?: string;
};

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
  const [fees, setFees] = useState<FeeItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '', lastName: '', category: 'ADULT' as 'ADULT' | 'CHILD',
    email: '', phone: '', address: '',
  });

  const [isResettingPass, setIsResettingPass] = useState(false);
  const [resetPassTemp, setResetPassTemp] = useState('');
  const [copiedReset, setCopiedReset] = useState(false);

  const [actionLoading, setActionLoading] = useState<'unassign' | 'delete' | null>(null);
  const [markingFee, setMarkingFee] = useState<string | null>(null);

  useEffect(() => {
    if (!dni) {
      setErrorMsg('Iniciá sesión para ver el alumno.');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const studentRes = await httpClient.get<StudentData>(`/students/dni/${dni}`);
        if (!studentRes || !studentRes.id) throw new Error('Alumno no encontrado');

        setStudent(studentRes);
        setEditForm({
          firstName: studentRes.firstName ?? '', lastName: studentRes.lastName ?? '',
          category: studentRes.category ?? 'ADULT', email: studentRes.email ?? '',
          phone: studentRes.phone ?? '', address: studentRes.address ?? '',
        });

        const feesRes = await httpClient.get<FeeItem[]>(`/fees/student/${studentRes.id}`);
        setFees(feesRes ?? []);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'No se pudo cargar el alumno.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dni, canManageForms]);



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
    if (!student?.id) return;
    setIsSaving(true);
    setErrorMsg('');
    try {
      const payload = {
        firstName: editForm.firstName.trim() || null, lastName: editForm.lastName.trim() || null,
        category: editForm.category, email: editForm.email.trim() || null,
        phone: editForm.phone.trim() || null, address: editForm.address.trim() || null,
      };
      
      const endpoint = isTeacher ? `/teacher/students/${student.id}` : `/students/${student.id}`;
      const res = await httpClient.request(endpoint, { method: 'PATCH', json: true, body: JSON.stringify(payload) });
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
    if (!student?.id || !confirm('¿Quieres desasignar este alumno?')) return;
    setActionLoading('unassign');
    try {
      await httpClient.post(`/teacher/students/${student.id}/unassign`, {});
      navigate(returnTo);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al desasignar.');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteStudent = async () => {
    if (!student?.id || !confirm('¿Quieres eliminar este alumno? Esta acción no se puede deshacer.')) return;
    setActionLoading('delete');
    try {
      const endpoint = isTeacher ? `/teacher/students/${student.id}` : `/students/${student.id}`;
      await httpClient.request(endpoint, { method: 'DELETE' });
      navigate(returnTo);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al eliminar.');
    } finally {
      setActionLoading(null);
    }
  };

  const studentName = useMemo(() => student ? `${student.firstName} ${student.lastName}` : 'Alumno', [student]);

  return {
    student, studentName, fees,
    isLoading, errorMsg, isEditing, isSaving, editForm, updateEditForm, toggleEditMode, saveProfile,
    isResettingPass, resetPassTemp, copiedReset, resetPassword, copyResetPassword,
    actionLoading, unassignStudent, deleteStudent,
    markingFee, markFeeAsPaid,
    returnTo, isTeacher
  };
}
