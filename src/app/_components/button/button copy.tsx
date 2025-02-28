type LinkButtonProps = {
  children: React.ReactNode;
  width?: "max" | "full";
  className?: string;
  href: string;
};

export const LinkButton = ({
  children,
  width = "max",
  className,
  href,
}: LinkButtonProps) => {
  return (
    <a
      href={href}
      className={`font-md rounded-md bg-slate-700 px-3 py-2 text-slate-50 w-${width} ${className}`}
    >
      {children}
    </a>
  );
};
