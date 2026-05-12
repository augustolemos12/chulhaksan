type SectionTitleProps = {
    eyebrow?: string;
    title: string;
    subtitle?: string;
};

export function SectionTitle({
    eyebrow,
    title,
    subtitle,
}: SectionTitleProps) {
    return (
        <div className="mb-4">
            {eyebrow && (
                <p className="text-[11px] uppercase tracking-[0.25em] text-primary font-bold mb-1">
                    {eyebrow}
                </p>
            )}

            <h2 className="text-xl font-bold text-[#1b0d0d]">
                {title}
            </h2>

            {subtitle && (
                <p className="text-sm text-gray-500 mt-1">
                    {subtitle}
                </p>
            )}
        </div>
    );
}