import {render, screen} from "@testing-library/react";
import {useRef} from "react";
import {afterEach, describe, expect, it} from "vitest";
import {
  type PopoverPlacement,
  type PopoverPosition,
  usePopoverPosition,
} from "./_usePopoverPosition";

// jsdom has no layout (every getBoundingClientRect is zeroed), so stub the
// anchor/floating rects via callback refs — these run before the hook's layout
// effect, so `compute` reads the stubbed geometry on its first pass.
function rect(r: Partial<DOMRect>): DOMRect {
  return {
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    toJSON() {},
    top: 0,
    width: 0,
    x: 0,
    y: 0,
    ...r,
  } as DOMRect;
}

interface HostProps {
  anchorRect: DOMRect;
  floatingRect: DOMRect;
  gap?: number;
  matchWidth?: boolean;
  placement: PopoverPlacement;
}

function Host({anchorRect, floatingRect, gap, matchWidth, placement}: HostProps) {
  const anchor = useRef<HTMLDivElement>(null);
  const floating = useRef<HTMLDivElement>(null);
  const pos = usePopoverPosition(anchor, floating, true, {
    gap,
    matchWidth,
    placement,
  });
  return (
    <>
      <div
        ref={(el) => {
          if (el) el.getBoundingClientRect = () => anchorRect;
          anchor.current = el;
        }}
      />
      <div
        ref={(el) => {
          if (el) el.getBoundingClientRect = () => floatingRect;
          floating.current = el;
        }}
      />
      <output data-testid="pos">{JSON.stringify(pos)}</output>
    </>
  );
}

function readPos(): PopoverPosition {
  return JSON.parse(screen.getByTestId("pos").textContent ?? "{}");
}

const original = {height: window.innerHeight, width: window.innerWidth};

function setViewport(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", {configurable: true, value: width});
  Object.defineProperty(window, "innerHeight", {configurable: true, value: height});
}

afterEach(() => {
  setViewport(original.width, original.height);
});

describe("usePopoverPosition", () => {
  it("places a bottom-start popover below the anchor's left edge", () => {
    setViewport(1000, 800);
    render(
      <Host
        anchorRect={rect({bottom: 140, left: 50, right: 150, top: 100, width: 100})}
        floatingRect={rect({height: 200, width: 80})}
        placement="bottom-start"
      />,
    );
    const pos = readPos();
    expect(pos.left).toBe(50);
    expect(pos.top).toBe(140);
    expect(pos.flippedVertically).toBe(false);
  });

  it("flips a bottom placement upward when there is no room below", () => {
    setViewport(1000, 800);
    render(
      <Host
        anchorRect={rect({bottom: 740, left: 50, right: 150, top: 700, width: 100})}
        floatingRect={rect({height: 200, width: 80})}
        placement="bottom-start"
      />,
    );
    const pos = readPos();
    expect(pos.flippedVertically).toBe(true);
    expect(pos.top).toBe(500); // anchor.top - height = 700 - 200
  });

  it("aligns a bottom-end popover to the anchor's right edge", () => {
    setViewport(1000, 800);
    render(
      <Host
        anchorRect={rect({bottom: 140, left: 50, right: 150, top: 100, width: 100})}
        floatingRect={rect({height: 100, width: 80})}
        placement="bottom-end"
      />,
    );
    expect(readPos().left).toBe(70); // right(150) - width(80)
  });

  it("matches the anchor width when matchWidth is set", () => {
    setViewport(1000, 800);
    render(
      <Host
        anchorRect={rect({bottom: 140, left: 50, right: 250, top: 100, width: 200})}
        floatingRect={rect({height: 100, width: 80})}
        matchWidth
        placement="bottom-start"
      />,
    );
    const pos = readPos();
    expect(pos.width).toBe(200);
    expect(pos.left).toBe(50);
  });
});
