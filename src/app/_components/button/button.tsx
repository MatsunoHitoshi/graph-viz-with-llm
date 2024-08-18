import { Loading } from "../loading/loading";

type ButtonProps = {
  id?: string;
  onClick?: () => void;
  children: React.ReactNode;
  type?: "button" | "submit";
  isLoading?: boolean;
  width?: "max" | "full";
};

export const Button = ({
  id,
  onClick,
  children,
  type = "button",
  isLoading = false,
  width = "max",
}: ButtonProps) => {
  return (
    <>
      {!isLoading ? (
        <button
          id={id}
          type={type}
          className={`font-md rounded-md bg-slate-700 px-3 py-2 text-slate-50 w-${width}`}
          onClick={onClick}
        >
          {children}
        </button>
      ) : (
        <div className="font-md flex flex-row items-center justify-center rounded-md bg-slate-700 px-3 py-2 text-slate-50">
          <Loading color="white" size={20} />
        </div>
      )}
    </>
  );
};
