import { Link } from 'react-router-dom';

type RequestItem = {
    id: string;
    name: string;
    dni: string;
    type: 'STUDENT_REQUEST' | 'TEACHER_INVITE';
    teacherName?: string;
    avatar?: string;
};

const requests: RequestItem[] = [
    {
        id: '1',
        name: 'María García',
        dni: '40.123.456',
        type: 'STUDENT_REQUEST',
        teacherName: 'Juan Díaz',
    },
    {
        id: '2',
        name: 'Carlos Ruiz',
        dni: '38.902.115',
        type: 'TEACHER_INVITE',
        teacherName: 'Prof. Ana',
    },
];

export function Requests() {
    return (
        <div className= "min-h-screen bg-background-light text-[#1b0d0d]" >
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-background-light/80 backdrop-blur-md" >
            <div className="flex items-center justify-between w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4" >
                <Link
            className="flex size-10 items-center justify-center rounded-full hover:bg-white transition-colors"
    to = "/profesor/alumnos"
        >
        <span className="material-symbols-outlined" > arrow_back </span>
            </Link>

            < div className = "text-center" >
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold" >
                    Gestión
                    </p>

                    < h1 className = "text-lg font-bold leading-tight" >
                        Solicitudes
                        </h1>
                        </div>

                        < button className = "flex size-10 items-center justify-center rounded-full hover:bg-white transition-colors" >
                            <span className="material-symbols-outlined" > tune </span>
                                </button>
                                </div>
                                </header>

                                < main className = "w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-24 space-y-5" >
                                    <section className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm" >
                                        <div className="flex items-start justify-between gap-4" >
                                            <div>
                                            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold" >
                                                Pendientes
                                                </p>

                                                < h2 className = "mt-2 text-xl font-bold" >
                                                    Revisá las solicitudes
                                                        </h2>

                                                        < p className = "mt-1 text-sm text-gray-500" >
                                                            Aceptá o rechazá alumnos e invitaciones pendientes.
              </p>
                                                                </div>

                                                                < div className = "h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0" >
                                                                    <span className="material-symbols-outlined text-3xl" >
                                                                        notifications
                                                                        </span>
                                                                        </div>
                                                                        </div>

                                                                        < div className = "mt-5 flex items-center gap-2 flex-wrap" >
                                                                            <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold" >
                                                                                { requests.length } pendiente
    { requests.length === 1 ? '' : 's' }
    </span>

        < span className = "rounded-full border border-yellow-200 bg-yellow-50 text-yellow-700 px-3 py-1 text-xs font-semibold" >
            Requieren acción
                </span>
                </div>
                </section>

                < section className = "space-y-4" >
                {
                    requests.map((request) => (
                        <div
              key= { request.id }
              className = "bg-white border border-gray-100 rounded-3xl p-5 shadow-sm"
                        >
                        <div className="flex items-start gap-4" >
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0" >
                    <span className="material-symbols-outlined" >
                    person
                    </span>
                    </div>

                    < div className = "flex-1 min-w-0" >
                    <div className="flex items-start justify-between gap-3" >
                    <div>
                    <p className="text-base font-bold leading-tight" >
                    { request.name }
                    </p>

                    < p className = "mt-1 text-xs text-gray-500" >
                    DNI { request.dni }
                    </p>
                    </div>

                    < span
                      className = {`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${request.type === 'STUDENT_REQUEST'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}
                    >
                {
                    request.type === 'STUDENT_REQUEST'
                        ? 'Solicitud'
                        : 'Invitación'
                }
                    </span>
                    </div>

                    < div className = "mt-4 rounded-2xl bg-background-light border border-gray-100 p-3" >
                        <p className="text-xs text-gray-500" >
                        {
                            request.type === 'STUDENT_REQUEST'
                                ? 'Solicita profesor'
                                : 'Invitación enviada por'
                        }
                            </p>

                            < p className = "mt-1 text-sm font-semibold" >
                                { request.teacherName }
                                </p>
                                </div>
                                </div>
                                </div>

                                < div className = "mt-5 grid grid-cols-2 gap-3" >
                                    <button
                  className="h-11 rounded-xl border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50 transition-colors"
    type = "button"
        >
        Rechazar
        </button>

        < button
    className = "h-11 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
    type = "button"
        >
        Aceptar
        </button>
        </div>
        </div>
          ))
}
</section>

{
    requests.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm text-center" >
            <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400" >
                <span className="material-symbols-outlined text-3xl" >
                    done_all
                    </span>
                    </div>

                    < h3 className = "mt-4 text-lg font-bold" >
                        Todo al día
                            </h3>

                            < p className = "mt-2 text-sm text-gray-500" >
                                No hay solicitudes pendientes.
            </p>
                                    </div>
        )
}
</main>
    </div>
  );
}