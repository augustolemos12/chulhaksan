import { Link } from 'react-router-dom';

type ActionCardProps = {
    to?: string;
    icon: string;
    title: string;
    subtitle: string;
    children?: React.ReactNode;
};

export function ActionCard({
    to,
    icon,
    title,
    subtitle,
    children,
}: ActionCardProps) {
    const content = (
        <div
            className="
        group
        rounded-2xl
        border border-gray-100
        bg-background-light
        p-4
        transition-all
        hover:shadow-lg
        hover:-translate-y-1
        hover:border-primary/20
        h-full
      "
        >
            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined">
                    {icon}
                </span>
            </div>

            <p className="text-sm font-bold text-[#1b0d0d]">
                {title}
            </p>

            <p className="text-xs text-gray-500 mt-1">
                {subtitle}
            </p>

            {children}
        </div>
    );

    if (to) {
        return <Link to={to}>{content}</Link>;
    }

    return content;
}