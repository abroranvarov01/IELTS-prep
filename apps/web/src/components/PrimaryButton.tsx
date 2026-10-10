import type { ReactNode } from "react";
import { PRIMARY_ACTION } from "./primary-action";

/** The one red action of a screen, when it does something in place. */
export function PrimaryButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className={PRIMARY_ACTION}>
      {children}
    </button>
  );
}
