import {fireEvent, render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {describe, expect, it} from "vitest";
import {TimePicker} from "./TimePicker";

describe("TimePicker a11y", () => {
  it("renders a dialog with the supporting line as its accessible name", () => {
    render(
      <TimePicker
        isVisible
        onClose={() => {}}
        value={{hours: 3, minutes: 0}}
      />,
    );
    expect(
      screen.getByRole("dialog", {name: "Select time"}),
    ).toBeInTheDocument();
  });

  it("exposes the dial as a slider with aria-valuenow and an aria-label", () => {
    render(
      <TimePicker
        isVisible
        onClose={() => {}}
        value={{hours: 3, minutes: 0}}
      />,
    );
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-label", "Hour");
    expect(slider).toHaveAttribute("aria-valuenow", "3");
  });

  it("steps aria-valuenow when ArrowUp is pressed on the slider", () => {
    render(
      <TimePicker
        isVisible
        onClose={() => {}}
        value={{hours: 3, minutes: 0}}
      />,
    );
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuenow", "3");
    fireEvent.keyDown(slider, {key: "ArrowUp"});
    expect(slider).toHaveAttribute("aria-valuenow", "4");
  });

  it("has no accessibility violations", async () => {
    const {container} = render(
      <TimePicker
        isVisible
        onClose={() => {}}
        value={{hours: 3, minutes: 0}}
      />,
    );
    expect(
      await axe(container, {
        rules: {"color-contrast": {enabled: false}},
      }),
    ).toHaveNoViolations();
  });
});
