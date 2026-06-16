import {render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {describe, expect, it} from "vitest";
import {BottomSheet} from "./BottomSheet";
import {SideSheet} from "./SideSheet";

describe("BottomSheet a11y", () => {
  it("renders as a modal dialog named by its label", () => {
    render(<BottomSheet isVisible label="Filters" />);
    const dialog = screen.getByRole("dialog", {name: "Filters"});
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("has no accessibility violations", async () => {
    const {container} = render(<BottomSheet isVisible label="Filters" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("SideSheet a11y", () => {
  it("renders as a dialog named by its title (aria-labelledby)", () => {
    render(<SideSheet isVisible title="Details" />);
    const dialog = screen.getByRole("dialog", {name: "Details"});
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(dialog).not.toHaveAttribute("aria-label");
  });

  it("falls back to the default 'Side sheet' name without a title", () => {
    render(<SideSheet isVisible />);
    const dialog = screen.getByRole("dialog", {name: "Side sheet"});
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-label", "Side sheet");
    expect(dialog).not.toHaveAttribute("aria-labelledby");
  });
});
