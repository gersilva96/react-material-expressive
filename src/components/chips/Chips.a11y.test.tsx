import {fireEvent, render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {describe, expect, it, vi} from "vitest";
import {Chips} from "./Chips";

describe("Chips (a11y)", () => {
  it("renders the label as a chip button", () => {
    render(
      <Chips onRemove={() => {}} variant="input">
        Tag
      </Chips>,
    );
    expect(screen.getByRole("button", {name: "Tag"})).toBeInTheDocument();
  });

  it("exposes a separate Remove button not nested inside the chip body", () => {
    render(
      <Chips onRemove={() => {}} variant="input">
        Tag
      </Chips>,
    );
    const remove = screen.getByRole("button", {name: "Remove"});
    const chip = screen.getByRole("button", {name: "Tag"});
    expect(remove).not.toBe(chip);
    // Interactive controls cannot legally nest inside a <button>.
    expect(chip).not.toContainElement(remove);
    expect(remove).not.toContainElement(chip);
  });

  it("calls onRemove when the remove button is clicked", () => {
    const onRemove = vi.fn();
    render(
      <Chips onRemove={onRemove} variant="input">
        Tag
      </Chips>,
    );
    fireEvent.click(screen.getByRole("button", {name: "Remove"}));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("renders the remove affordance as a real, enabled native button", () => {
    render(
      <Chips onRemove={() => {}} variant="input">
        Tag
      </Chips>,
    );
    const remove = screen.getByRole("button", {name: "Remove"});
    // A native <button> handles Enter/Space activation for free.
    expect(remove.tagName).toBe("BUTTON");
    expect(remove).not.toBeDisabled();
    expect(remove).toHaveAttribute("type", "button");
  });

  it("has no accessibility violations", async () => {
    const {container} = render(
      <Chips onRemove={() => {}} variant="input">
        Tag
      </Chips>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
