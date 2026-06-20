import {ElementType, ReactNode} from "react";
import {cn} from "../../utils/helpers";

export interface TextElementProps {
  /** Wrapper element, used only when more than one slot is rendered. Default
   *  "div". With a single slot there is no wrapper — the text element is
   *  rendered directly (semantic HTML; see the docs). */
  as?: ElementType;
  /** Supporting text (body-medium, on-surface-variant). */
  body?: ReactNode;
  /** Element for the body slot. Default "p". */
  bodyAs?: ElementType;
  bodyStyle?: string;
  className?: string;
  /** Overline label (label-medium, on-surface-variant). */
  label?: ReactNode;
  /** Element for the label slot. Default "p". */
  labelAs?: ElementType;
  labelStyle?: string;
  /** Main text (title-medium, on-surface). */
  title?: ReactNode;
  /** Element for the title slot. Default "h2" — set per heading hierarchy
   *  (M3 a11y: heading level follows content, not visual style). */
  titleAs?: ElementType;
  titleStyle?: string;
}

/**
 * Label / title / body text stack on the M3 type scale. Each slot renders only
 * when provided and its element is polymorphic (`labelAs`/`titleAs`/`bodyAs`,
 * defaulting to p/h2/p). With a single slot the element is rendered **directly**
 * — no wrapper `<div>` — so e.g. a lone title is a bare `<h2>` (`className`
 * applies to it). With two or more slots they are stacked in the `as` wrapper
 * (default "div").
 */
function TextElement({
  as: Wrapper = "div",
  body,
  bodyAs: Body = "p",
  bodyStyle,
  className,
  label,
  labelAs: Label = "p",
  labelStyle,
  title,
  titleAs: Title = "h2",
  titleStyle,
}: TextElementProps) {
  // A single slot renders the text element directly (no wrapper), so `className`
  // lands on it; multiple slots get the flex-column wrapper.
  const bare = [label, title, body].filter(Boolean).length === 1;

  const labelNode = label ? (
    <Label
      className={cn(
        "text-label-medium text-on-surface-variant",
        labelStyle,
        bare && className,
      )}>
      {label}
    </Label>
  ) : null;
  const titleNode = title ? (
    <Title className={cn("text-title-medium text-on-surface", titleStyle, bare && className)}>
      {title}
    </Title>
  ) : null;
  const bodyNode = body ? (
    <Body
      className={cn(
        "text-body-medium text-on-surface-variant",
        bodyStyle,
        bare && className,
      )}>
      {body}
    </Body>
  ) : null;

  if (bare) return labelNode ?? titleNode ?? bodyNode;

  return (
    <Wrapper
      className={cn(
        "flex flex-col items-start justify-center text-on-surface",
        className,
      )}>
      {labelNode}
      {titleNode}
      {bodyNode}
    </Wrapper>
  );
}

export {TextElement};
