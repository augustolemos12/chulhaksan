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
                <p className="text-xs uppercase tracking-widest text-primary font-bold mb-1">
                    {eyebrow}
                </p>
            )}

            <h2 className="font-display text-xl md:text-2xl font-bold text-text">
                {title}
            </h2>

            {subtitle && (
                <p className="text-sm text-muted mt-1 font-medium">
                    {subtitle}
                </p>
            )}
        </div>
    );
}