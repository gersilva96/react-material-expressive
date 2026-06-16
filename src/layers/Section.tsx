import {ReactNode} from "react";
import {cn} from "../utils/helpers";

export interface SectionProps {
  children: ReactNode;
  className?: string;
}

/** Responsive content section: column on small screens, row on large. */
function Section({children, className}: SectionProps) {
  return (
    <section
      className={cn(
        "flex h-fit w-full flex-col items-center gap-6 px-3 lg:flex-row",
        className,
      )}>
      {children}
    </section>
  );
}

export {Section};
