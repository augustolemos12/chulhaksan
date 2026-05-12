import { Link } from 'react-router-dom';

type StudentAttendance = {
  id: number;
  name: string;
  belt: string;
  beltColor: string;
  avatar: string;
  present: boolean;
};

const students: StudentAttendance[] = [
  {
    id: 1,
    name: 'Mateo García',
    belt: 'Cinturón Blanco',
    beltColor: 'bg-white border border-gray-300',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDWty76--705yT24M48_A_ZBjH-8h70y_Qm_zVlqpOVu9U5kGmSkphSFaODPCWWpdlP67kcxR7UxDHBGsLOBAIAJFZYAtY4qi1r7RKfx_HT25-t1Mq5XtLg_iHu0o4EMWuUeYTwMo5_JIqy4NKcZoPUYxGX9MRRveahm5ml55J6SVjE-A5sT4Dg7QaHmIqbUqRy3URbikhL4VenB1tMFhXerkXCSmWxuJ3xqehbERvmiTZ5RvSvxYpzd3-6leuIt9CyBaQN_8zZd6FP',
    present: true,
  },
  {
    id: 2,
    name: 'Sofía Rodríguez',
    belt: 'Cinturón Amarillo',
    beltColor: 'bg-yellow-400',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB6UooFRMU5pXrrI1FoajASFJhgA7uz1y-icrT9MQAtEIyqJLjlR7QR-Gts6YG5poWoXYcnhhI8CeEu0fBcBnBGLkhmS_HeF6R5ak_9DXW4i1iq_xUlflmqUy8y5b-FU7UydTnAHTpi75BabPVz0nMjcZCD3L46YddDaA4OT5G6bVekVJ4bIpBscPdyloNCLM5CqCC0xwTe82D3CfUhgG2YqL6aJ7FqtYKy1hXdU_j5TKdYJOIwYnfm7LV20X-0XKZ1eOhnKM8Ch-tQ',
    present: false,
  },
  {
    id: 3,
    name: 'Lucas Martínez',
    belt: 'Cinturón Azul',
    beltColor: 'bg-blue-500',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA25zy8YMmQjKG-R_08Krq26100oSAJAxQud0DhmpRYiLQ1Cl7SdUgklvwzA0SSHs7xGyq-QZovsFZJTZeUV_0EMHG3VyMJjfwfeeMV2Vlq6epbO2VfRKr9tC504cZvs-elNX6ow6In3Ut_Y0DEyGT3V_KyX8O-bbF9RB0Z7k72rhjc61fZh23Y8-C89tnEYhXdzV9ESkmaTlW1oaMW4TVc3dKCHBLbR9T0pihWxNf10aiLq7vBjjDXlS36Z8dEL9lgxUMf03j0XCdt',
    present: true,
  },
];

const weekDays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

function StudentCard({ student }: { student: StudentAttendance }) {
  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-sm border border-[#e7cfcf]">
      <div className="flex items-center gap-4">
        <div
          className="h-12 w-12 rounded-full bg-cover bg-center border-2 border-gray-200"
          style={{ backgroundImage: `url("${student.avatar}")` }}
        />
        <div>
          <p className="font-semibold text-[#1b0d0d]">{student.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-3 h-3 rounded-full ${student.beltColor}`} />
            <span className="text-xs text-[#9a4c4c]">{student.belt}</span>
          </div>
        </div>
      </div>

      <input
        type="checkbox"
        checked={student.present}
        readOnly
        className="h-5 w-5 rounded border-[#e7cfcf]"
      />
    </div>
  );
}

export function Attendance() {
  const presentCount = students.filter((student) => student.present).length;

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <header className="sticky top-0 z-20 bg-background-light/90 backdrop-blur-md border-b border-[#e7cfcf]">
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
          <Link
            to="/profesor/alumnos"
            className="flex size-10 items-center justify-center"
          >
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </Link>

          <h1 className="font-bold text-lg">Toma de asistencia</h1>

          <button>
            <span className="material-symbols-outlined">more_horiz</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full pb-32 space-y-5 p-4">
        <section className="bg-white rounded-xl border border-[#e7cfcf] p-4">
          <div className="flex justify-between items-center mb-4">
            <button>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            <h2 className="font-bold">Octubre 2023</h2>

            <button>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          <div className="grid grid-cols-7 text-center gap-1">
            {weekDays.map((day) => (
              <span key={day} className="text-xs font-bold text-[#9a4c4c]">
                {day}
              </span>
            ))}

            {Array.from({ length: 7 }, (_, index) => (
              <button
                key={index}
                className={`h-10 rounded-full ${
                  index === 4
                    ? 'bg-primary text-white'
                    : 'text-[#1b0d0d] hover:bg-gray-100'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-semibold text-[#9a4c4c] uppercase">
              Estudiantes ({students.length})
            </p>

            <button className="text-primary text-sm font-bold">
              Marcar todos
            </button>
          </div>

          <div className="space-y-3">
            {students.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-background-light/95 backdrop-blur-md p-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-sm mb-3">
            {presentCount} estudiantes presentes
          </p>

          <button className="w-full bg-primary text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2">
            <span className="material-symbols-outlined">save</span>
            Guardar asistencia
          </button>
        </div>
      </footer>
    </div>
  );
}