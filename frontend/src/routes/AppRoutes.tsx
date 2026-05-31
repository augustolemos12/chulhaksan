import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

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
import { AdminEventView } from '../modules/admin/views/AdminEventView';
import { AdminFeeConfigView } from '../modules/admin/views/AdminFeeConfigView';
import { AdminClassGroupsView } from '../modules/admin/views/AdminClassGroupsView';
import { AdminClassPlansView } from '../modules/admin/views/AdminClassPlansView';
import { FeesManagementView } from '../modules/admin/views/FeesManagementView';

// Teacher
import { TeacherStudentsView } from '../modules/teacher/views/TeacherStudentsView';
import { TeacherClassGroupsView } from '../modules/teacher/views/TeacherClassGroupsView';
import { TeacherAttendanceView } from '../modules/teacher/views/TeacherAttendanceView';
import { TeacherPaymentView } from '../modules/teacher/views/TeacherPaymentView';
import { TeacherClassPlansView } from '../modules/teacher/views/TeacherClassPlansView';

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
            <Route path="/dashboard" element={<ProtectedRoute><DashboardView /></ProtectedRoute>} />
            <Route path="/pagos" element={<ProtectedRoute allowedRoles={['STUDENT']}><MyPaymentsView /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin/alumnos" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminStudentsView /></ProtectedRoute>} />
            <Route path="/admin/profesores" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminTeachersView /></ProtectedRoute>} />
            <Route path="/admin/gimnasios" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminGymsView /></ProtectedRoute>} />
            <Route path="/admin/eventos" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminEventView /></ProtectedRoute>} />
            <Route path="/admin/cuota-global" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminFeeConfigView /></ProtectedRoute>} />
            <Route path="/admin/comisiones" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminClassGroupsView /></ProtectedRoute>} />
            <Route path="/admin/planes" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminClassPlansView /></ProtectedRoute>} />
            <Route path="/admin/cuotas" element={<ProtectedRoute allowedRoles={['ADMIN']}><FeesManagementView /></ProtectedRoute>} />

            {/* Teacher */}
            <Route path="/profesor/comisiones" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherClassGroupsView /></ProtectedRoute>} />
            <Route path="/profesor/alumnos" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherStudentsView /></ProtectedRoute>} />
            <Route path="/profesor/comisiones/:classGroupId/asistencia" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherAttendanceView /></ProtectedRoute>} />
            <Route path="/profesor/datos-de-pago" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherPaymentView /></ProtectedRoute>} />
            <Route path="/profesor/cuotas" element={<ProtectedRoute allowedRoles={['TEACHER']}><FeesManagementView /></ProtectedRoute>} />
            <Route path="/profesor/planes" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherClassPlansView /></ProtectedRoute>} />

            {/* Student */}
            <Route path="/perfil" element={<ProtectedRoute allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}><StudentProfileView /></ProtectedRoute>} />
            <Route path="/alumno/asistencia" element={<ProtectedRoute allowedRoles={['STUDENT']}><MyAttendanceView /></ProtectedRoute>} />
            <Route path="/alumno/formas" element={<ProtectedRoute allowedRoles={['STUDENT']}><MyFormsView /></ProtectedRoute>} />
            
            {/* Shared */}
            <Route path="/alumno/:dni" element={<ProtectedRoute allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}><StudentDetailsView /></ProtectedRoute>} />
            <Route path="/admin/formas" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'STUDENT']}><FormsManagerView /></ProtectedRoute>} />
        </Routes>
    );
}