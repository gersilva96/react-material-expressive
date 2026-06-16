import {ComponentProps, useEffect, useRef} from "react";
import {cn} from "../../utils/helpers";

export type VideoProps = ComponentProps<"video">;

/**
 * Native looping video for ambient/media content: muted, autoplay and
 * inline by default (override via props), object-fit cover. Autoplay is
 * decorative motion lasting >5s, so it is paused under
 * `prefers-reduced-motion: reduce` (WCAG 2.2.2 Pause, Stop, Hide); pass
 * `controls` for an explicit play affordance.
 */
function Video({
  autoPlay = true,
  className,
  loop = true,
  muted = true,
  playsInline = true,
  ref,
  ...props
}: VideoProps) {
  const innerRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = innerRef.current;
    if (!video || !autoPlay) return;
    // Keep ambient autoplay paused while the user prefers reduced motion.
    // The `play` listener also catches the browser's autoplay-when-ready,
    // which fires asynchronously (after this effect has run).
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pauseIfReduced = () => {
      if (reduced.matches) video.pause();
    };
    const sync = () => {
      if (reduced.matches) video.pause();
      else void video.play().catch(() => {});
    };
    sync();
    video.addEventListener("play", pauseIfReduced);
    reduced.addEventListener("change", sync);
    return () => {
      video.removeEventListener("play", pauseIfReduced);
      reduced.removeEventListener("change", sync);
    };
  }, [autoPlay]);

  return (
    <video
      autoPlay={autoPlay}
      className={cn("h-full w-full object-cover", className)}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      {...props}
    />
  );
}

export {Video};
