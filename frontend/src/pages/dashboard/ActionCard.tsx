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
        bg-surface 
        rounded-2xl 
        border border-transparent hover:border-primary/20
        shadow-soft hover:shadow-md
        p-6 
        flex flex-col items-center justify-center text-center
        transition-all duration-300
        cursor-pointer
        h-full
      "
        >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-[28px]">
                    {icon}
                </span>
            </div>

            <p className="text-sm font-bold text-text uppercase tracking-wide">
                {title}
            </p>

            {subtitle && (
                <p className="text-xs font-medium text-muted mt-2">
                    {subtitle}
                </p>
            )}

            {children}
        </div>
    );

    if (to) {
        return <Link to={to}>{content}</Link>;
    }

    return content;
}