export function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="btn-primary"
      {...props}
    >
      {children}
    </button>
  );
}