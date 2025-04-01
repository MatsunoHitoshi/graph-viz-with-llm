import { Loading } from "../loading/loading";

type ButtonProps = {
  id?: string;
  onClick?: () => void;
  children: React.ReactNode;
  type?: "button" | "submit";
  isLoading?: boolean;
  width?: "max" | "full";
  className?: string;
  disabled?: boolean;
};

export const Button = ({
  id,
  onClick,
  children,
  type = "button",
  isLoading = false,
  width = "max",
  className,
  disabled = false,
}: ButtonProps) => {
  return (
    <>
      {!isLoading ? (
        <button
          id={id}
          type={type}
          className={`font-md rounded-md bg-slate-700 px-3 py-2 text-slate-50 w-${width} ${className}`}
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </button>
      ) : (
        <div className="font-md flex flex-row items-center justify-center rounded-md bg-slate-700 px-3 py-2 text-slate-50 hover:bg-slate-700/90">
          <Loading color="white" size={20} />
        </div>
      )}
    </>
  );
};
