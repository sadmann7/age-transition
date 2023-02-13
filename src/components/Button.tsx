import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({ className, children, ...props }: ButtonProps) => {
  return (
    <button
      className={`rounded-md px-4 py-1.5 text-base font-semibold text-white ring-1 ring-indigo-500 enabled:transition enabled:hover:bg-neutral-700 enabled:active:bg-transparent disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
