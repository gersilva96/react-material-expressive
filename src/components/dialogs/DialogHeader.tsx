import {ReactNode, useContext, useEffect} from "react";
import {Icon} from "../../elements/common/Icon";
import {cn} from "../../utils/helpers";
import {DialogContext} from "./_context";

export interface DialogHeaderProps {
  className?: string;
  /** Headline (headline-small). */
  headline?: ReactNode;
  /** Hero icon (24px, centered, secondary color). */
  icon?: ReactNode;
  /** Supporting text (body-medium). */
  text?: ReactNode;
}

function DialogHeader({className, headline, icon, text}: DialogHeaderProps) {
  const centered = Boolean(icon);
  const {headlineId, setLabelled} = useContext(DialogContext);
  // Tell the dialog whether its headline names it (so it applies
  // aria-labelledby only when this <h2> is actually rendered).
  useEffect(() => {
    setLabelled?.(Boolean(headline));
    return () => setLabelled?.(false);
  }, [headline, setLabelled]);
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        centered && "items-center text-center",
        className,
      )}>
      {icon ? (
        <span className="flex text-secondary">
          <Icon icon={icon} size={24} />
        </span>
      ) : null}
      {headline ? (
        <h2 className="text-headline-small text-on-surface" id={headlineId}>
          {headline}
        </h2>
      ) : null}
      {text ? (
        <p className="text-body-medium text-on-surface-variant">{text}</p>
      ) : null}
    </div>
  );
}

export {DialogHeader};
