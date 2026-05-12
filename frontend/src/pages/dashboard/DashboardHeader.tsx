type DashboardHeaderProps = {
  title: string;
  onLogout: () => void;
};

export function DashboardHeader({ title, onLogout }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-10">
      <h1 className="text-xl font-bold text-[#1b0d0d]">{title}</h1>
      <button onClick={onLogout} className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
        Salir
      </button>
    </header>
  );
}
