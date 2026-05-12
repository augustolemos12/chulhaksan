import type { AuthProfile } from '../auth/auth';

type ProfileCardProps = {
  profile: AuthProfile | null;
  displayName: string;
};

export function ProfileCard({ profile, displayName }: ProfileCardProps) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-4">
      <div className="bg-primary/10 text-primary h-14 w-14 rounded-full flex items-center justify-center">
        <span className="material-symbols-outlined text-3xl">person</span>
      </div>
      <div>
        <p className="text-lg font-bold text-[#1b0d0d]">{displayName || 'Usuario'}</p>
        <p className="text-sm text-gray-500 capitalize">{profile?.role === 'STUDENT' ? 'Alumno' : profile?.role === 'TEACHER' ? 'Profesor' : 'Administrador'}</p>
      </div>
    </div>
  );
}
