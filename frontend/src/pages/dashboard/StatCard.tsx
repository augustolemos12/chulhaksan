type StatCardProps = {
    label: string;
    value: number | string;
    icon: string;
};

export function StatCard({
    label,
    value,
    icon,
}: StatCardProps) {
    return (
        <div className="rounded-2xl bg-background border border-border p-4">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted">
                    {label}
                </span>

                <span className="material-symbols-outlined text-primary">
                    {icon}
                </span>
            </div>

            <p className="mt-3 text-3xl font-black text-text">
                {value}
            </p>
        </div>
    );
}