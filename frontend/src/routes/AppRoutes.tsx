import { Routes, Route } from 'react-router-dom';

import { Home } from '../pages/Home';
import { Login } from '../pages/auth/Login';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ForgotPasswordSuccess } from '../pages/auth/ForgotPasswordSuccess';
import { ChangePassword } from '../pages/auth/ChangePassword';
import { GymAttendance } from '../pages/GymAttendance';

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/recuperar" element={<ForgotPassword />} />
            <Route
                path="/recuperar/enviado"
                element={<ForgotPasswordSuccess />}
            />
            <Route
                path="/cambiar-contrasena"
                element={<ChangePassword />}
            />

            <Route
                path="/attendance/:gymId"
                element={<GymAttendance />}
            />
        </Routes>
    );
}