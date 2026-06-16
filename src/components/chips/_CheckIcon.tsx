import {cn} from "../../utils/helpers";

/**
 * 18px checkmark drawn by stroke-dashoffset (150ms MDC standard, 50ms
 * delay — the @material/web labs segmented graphic). Used by the filter
 * Chips selection graphic.
 */
function CheckIcon({selected}: {selected: boolean}) {
  return (
    <svg aria-hidden fill="none" height={18} viewBox="0 0 24 24" width={18}>
      <path
        className={cn("segmentedCheck", selected && "segmentedCheckDraw")}
        d="M5 12.5 10 17.5 19 7.5"
        pathLength={1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

export {CheckIcon};
