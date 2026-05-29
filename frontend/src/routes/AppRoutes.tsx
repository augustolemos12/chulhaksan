import { Routes, Route } from 'react-router-dom';

// Public Views
import { LandingPage } from '../modules/public/views/LandingPage';
import { GymAttendanceView } from '../modules/public/views/GymAttendanceView';
import { LoginView } from '../modules/auth/views/LoginView';
import { ChangePasswordView } from '../modules/auth/views/ChangePasswordView';


// Dashboard
import { DashboardView } from '../modules/dashboard/views/DashboardView';

// Admin
import { AdminStudentsView } from '../modules/admin/views/AdminStudentsView';
import { AdminTeachersView } from '../modules/admin/views/AdminTeachersView';
import { AdminGymsView } from '../modules/admin/views/AdminGymsView';

// Teacher
import { TeacherStudentsView } from '../modules/teacher/views/TeacherStudentsView';
import { TeacherGymsView } from '../modules/teacher/views/TeacherGymsView';
import { TeacherAttendanceView } from '../modules/teacher/views/TeacherAttendanceView';
import { TeacherPaymentView } from '../modules/teacher/views/TeacherPaymentView';

// Student
import { StudentProfileView } from '../modules/student/views/StudentProfileView';
import { MyAttendanceView } from '../modules/student/views/MyAttendanceView';
import { MyFormsView } from '../modules/student/views/MyFormsView';
import { StudentDetailsView } from '../modules/student/views/StudentDetailsView';
import { MyPaymentsView } from '../modules/student/views/MyPaymentsView';

// Shared
import { FormsManagerView } from '../modules/forms/views/FormsManagerView';

export function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/cambiar-contrasena" element={<ChangePasswordView />} />
            <Route path="/attendance/:gymId" element={<GymAttendanceView />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/pagos" element={<MyPaymentsView />} />

            {/* Admin */}
            <Route path="/admin/alumnos" element={<AdminStudentsView />} />
            <Route path="/admin/profesores" element={<AdminTeachersView />} />
            <Route path="/admin/gimnasios" element={<AdminGymsView />} />

            {/* Teacher */}
            <Route path="/profesor/alumnos" element={<TeacherStudentsView />} />
            <Route path="/profesor/gimnasios" element={<TeacherGymsView />} />
            <Route path="/profesor/gimnasios/:gymId/asistencia" element={<TeacherAttendanceView />} />
            <Route path="/profesor/datos-de-pago" element={<TeacherPaymentView />} />

            {/* Student */}
            <Route path="/alumno/perfil" element={<StudentProfileView />} />
            <Route path="/alumno/asistencia" element={<MyAttendanceView />} />
            <Route path="/alumno/formas" element={<MyFormsView />} />
            
            {/* Shared */}
            <Route path="/alumno/:dni" element={<StudentDetailsView />} />
            <Route path="/admin/formas" element={<FormsManagerView />} />
        </Routes>
    );
}