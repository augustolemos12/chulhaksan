import type { AuthProfile } from '../auth/auth';

type ProfileCardProps = {
  profile: AuthProfile | null;
  displayName: string;
};

export function ProfileCard({ profile, displayName }: ProfileCardProps) {
  const roleName = profile?.role === 'STUDENT' ? 'Alumno' : profile?.role === 'TEACHER' ? 'Profesor' : 'Administrador';

  return (
    <div className="mb-8 mt-2">
      <h2 className="font-display text-2xl md:text-3xl text-text">
        ¡Hola, <span className="text-primary font-bold">{displayName || roleName}</span>!
      </h2>
      <p className="text-muted mt-1 font-medium">
        {profile?.role === 'STUDENT'
          ? 'Tu próximo cinturón te espera. ¡Sigue entrenando!'
          : `Panel de control del ${roleName.toLowerCase()}`
        }
      </p>
    </div>
  );
}
