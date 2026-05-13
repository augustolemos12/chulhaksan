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
        shadow-soft
        p-5
        ${className}
      `}
        >
            {children}
        </div>
    );
}