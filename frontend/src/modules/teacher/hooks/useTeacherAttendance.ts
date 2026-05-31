import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { httpClient } from '../../../core/api/httpClient';

export type StudentAttendance = {
  id: number;
  dni: string;
  firstName: string;
  lastName: string;
  currentBelt: string;
  avatar?: string;
};

export type ClassGroupInfo = {
  id: number;
  name?: string;
  daysOfWeek: string[];
  gym?: { name: string };
};

export function useTeacherAttendance() {
  const { classGroupId } = useParams();
  
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const [classGroup, setClassGroup] = useState<ClassGroupInfo | null>(null);
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({}); // key: `${studentId}_${day}`
  
  // Class Plan (total classes)
  const [classPlanId, setClassPlanId] = useState<number | null>(null);
  const [totalClasses, setTotalClasses] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    if (!classGroupId) return;
    setLoading(true); setError(''); setSuccess('');

    try {
      // 1. Fetch ClassGroup info (to get daysOfWeek and name)
      if (!classGroup) {
        const resGroup = await httpClient.request(`/class-groups/${classGroupId}`);
        if (resGroup.ok) {
          const dataGroup = await resGroup.json();
          setClassGroup(dataGroup);
        }
      }

      // 2. Fetch Students
      const resStudents = await httpClient.request(`/teachers/me/students?classGroupId=${classGroupId}&limit=100`);
      if (!resStudents.ok) throw new Error('No se pudieron cargar los alumnos.');
      const dataStudents = await resStudents.json() as any;
      const loadedStudents: StudentAttendance[] = Array.isArray(dataStudents) ? dataStudents : (dataStudents?.items ?? dataStudents?.data ?? []);
      setStudents(loadedStudents);

      // 3. Fetch Class Plan (total classes expected)
      const resPlan = await httpClient.request(`/class-plans?classGroupId=${classGroupId}&month=${month}&year=${year}`);
      if (resPlan.ok) {
        const planData = await resPlan.json();
        const planList = Array.isArray(planData) ? planData : (planData?.items ?? planData?.data ?? []);
        if (planList.length > 0) {
          setClassPlanId(planList[0].id);
          setTotalClasses(String(planList[0].totalClasses));
        } else {
          setClassPlanId(null);
          setTotalClasses(''); // User will need to set it
        }
      }

      // 4. Fetch Monthly Attendance
      const resAtt = await httpClient.request(`/attendance?classGroupId=${classGroupId}&month=${month}&year=${year}`);
      if (!resAtt.ok) throw new Error('No se pudo cargar la asistencia mensual.');
      const attData = await resAtt.json();
      const attList = Array.isArray(attData) ? attData : (attData?.items ?? attData?.data ?? []);
      
      const nextMap: Record<string, boolean> = {};
      for (const record of attList) {
        if (record.present) {
          const d = new Date(record.date);
          const day = d.getUTCDate(); // Keep it consistent with how it was saved
          nextMap[`${record.studentId}_${day}`] = true;
        }
      }
      setAttendanceMap(nextMap);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [classGroupId, month, year]);

  const handleToggle = (studentId: number, day: number) => {
    setAttendanceMap((prev) => {
      const key = `${studentId}_${day}`;
      return { ...prev, [key]: !prev[key] };
    });
  };

  const handleToggleColumn = (day: number) => {
    // Check if all students in this day are present
    const allPresent = students.every(s => attendanceMap[`${s.id}_${day}`]);
    const nextVal = !allPresent;

    setAttendanceMap(prev => {
      const nextMap = { ...prev };
      for (const s of students) {
        nextMap[`${s.id}_${day}`] = nextVal;
      }
      return nextMap;
    });
  };

  const handleSavePlan = async () => {
    if (!classGroupId || !totalClasses.trim()) return;
    const num = Number(totalClasses);
    if (isNaN(num) || num <= 0) return;

    setWorking(true); setError(''); setSuccess('');
    try {
      if (classPlanId) {
        // PATCH
        const res = await httpClient.request(`/class-plans/${classPlanId}`, {
          method: 'PATCH', json: true, body: JSON.stringify({ totalClasses: num })
        });
        if (!res.ok) throw new Error('Error al actualizar las clases del mes');
      } else {
        // POST
        const res = await httpClient.request(`/class-plans`, {
          method: 'POST', json: true, body: JSON.stringify({
            classGroupId: Number(classGroupId), month, year, totalClasses: num
          })
        });
        if (!res.ok) throw new Error('Error al guardar las clases del mes');
        const created = await res.json();
        setClassPlanId(created.id);
      }
      setSuccess('Cantidad de clases guardada');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el plan');
    } finally {
      setWorking(false);
    }
  };

  const handleSaveAttendance = async (day: number) => {
    if (!classGroupId) return;
    
    setWorking(true); setError(''); setSuccess('');
    
    // Construct Date for this day (UTC)
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    try {
      const records = students.map((s) => ({
        studentId: s.id,
        present: Boolean(attendanceMap[`${s.id}_${day}`]),
      }));

      const res = await httpClient.request(`/attendance/bulk`, {
        method: 'POST',
        json: true,
        body: JSON.stringify({
          classGroupId: Number(classGroupId),
          date: dateStr,
          records,
        }),
      });

      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'Error al guardar asistencia.');
      setSuccess(`Asistencia del día ${day} guardada.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar asistencia.');
    } finally {
      setWorking(false);
    }
  };

  // Calculate days of class based on daysOfWeek and month
  const classDaysInMonth = useMemo(() => {
    if (!classGroup || !classGroup.daysOfWeek || classGroup.daysOfWeek.length === 0) {
      // If no days defined, just return all days of the month up to 31
      const numDays = new Date(year, month, 0).getDate();
      return Array.from({ length: numDays }, (_, i) => i + 1);
    }

    const dayMapping: Record<string, number> = {
      SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
      THURSDAY: 4, FRIDAY: 5, SATURDAY: 6
    };
    
    const validWeekdays = classGroup.daysOfWeek.map(d => dayMapping[d]);
    const days: number[] = [];
    const numDays = new Date(year, month, 0).getDate();
    
    for (let day = 1; day <= numDays; day++) {
      const date = new Date(year, month - 1, day);
      if (validWeekdays.includes(date.getDay())) {
        days.push(day);
      }
    }
    
    return days;
  }, [classGroup, month, year]);

  return {
    year, setYear, month, setMonth,
    classGroup, students, attendanceMap,
    classPlanId, totalClasses, setTotalClasses, handleSavePlan,
    classDaysInMonth,
    loading, working, error, success,
    handleToggle, handleToggleColumn, handleSaveAttendance
  };
}
