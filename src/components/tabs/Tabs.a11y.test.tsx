import {fireEvent, render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {describe, expect, it} from "vitest";
import {TabsPrimary} from "./TabsPrimary";

const tabs = [
  {header: "A", id: "a"},
  {header: "B", id: "b"},
  {header: "C", id: "c"},
];

describe("TabsPrimary a11y", () => {
  it("renders a tablist with one tab per item", () => {
    render(<TabsPrimary defaultSelected="a" tabs={tabs} />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  });

  it("applies roving tabindex: only the selected tab is focusable", () => {
    render(<TabsPrimary defaultSelected="a" tabs={tabs} />);
    const [a, b, c] = screen.getAllByRole("tab");
    expect(a).toHaveAttribute("tabindex", "0");
    expect(b).toHaveAttribute("tabindex", "-1");
    expect(c).toHaveAttribute("tabindex", "-1");
    expect(a).toHaveAttribute("aria-selected", "true");
    expect(b).toHaveAttribute("aria-selected", "false");
  });

  it("moves selection with ArrowRight (automatic activation)", () => {
    render(<TabsPrimary defaultSelected="a" tabs={tabs} />);
    fireEvent.keyDown(screen.getByRole("tablist"), {key: "ArrowRight"});
    const [a, b] = screen.getAllByRole("tab");
    expect(b).toHaveAttribute("aria-selected", "true");
    expect(b).toHaveAttribute("tabindex", "0");
    expect(a).toHaveAttribute("aria-selected", "false");
    expect(a).toHaveAttribute("tabindex", "-1");
  });

  it("wraps to the first tab with ArrowRight from the last", () => {
    render(<TabsPrimary defaultSelected="c" tabs={tabs} />);
    fireEvent.keyDown(screen.getByRole("tablist"), {key: "ArrowRight"});
    const [a] = screen.getAllByRole("tab");
    expect(a).toHaveAttribute("aria-selected", "true");
  });

  it("moves selection left with ArrowLeft (with wrap)", () => {
    render(<TabsPrimary defaultSelected="a" tabs={tabs} />);
    fireEvent.keyDown(screen.getByRole("tablist"), {key: "ArrowLeft"});
    const [, , c] = screen.getAllByRole("tab");
    expect(c).toHaveAttribute("aria-selected", "true");
  });

  it("jumps to the last tab with End and the first with Home", () => {
    render(<TabsPrimary defaultSelected="a" tabs={tabs} />);
    const tablist = screen.getByRole("tablist");
    fireEvent.keyDown(tablist, {key: "End"});
    const [a, , c] = screen.getAllByRole("tab");
    expect(c).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(tablist, {key: "Home"});
    expect(a).toHaveAttribute("aria-selected", "true");
  });

  it("has no accessibility violations", async () => {
    const {container} = render(<TabsPrimary defaultSelected="a" tabs={tabs} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
