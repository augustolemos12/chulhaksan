type DashboardCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function DashboardCard({
  children,
  className = '',
}: DashboardCardProps) {
  return (
    <div
      className={`
        bg-white/90
        backdrop-blur-sm
        rounded-3xl
        border border-white/40
        shadow-[0_8px_30px_rgb(0,0,0,0.04)]
        p-5
        ${className}
      `}
    >
      {children}
    </div>
  );
}
