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
        <div className="rounded-2xl bg-background-light border border-gray-100 p-4">
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                    {label}
                </span>

                <span className="material-symbols-outlined text-primary">
                    {icon}
                </span>
            </div>

            <p className="mt-3 text-3xl font-black text-[#1b0d0d]">
                {value}
            </p>
        </div>
    );
}