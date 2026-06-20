import {fireEvent, render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {describe, expect, it} from "vitest";
import {SplitButton} from "./SplitButton";

describe("SplitButton", () => {
  it("renders the leading action and the trailing menu button", () => {
    render(
      <SplitButton menu={<SplitButton.Item>One</SplitButton.Item>}>
        Save
      </SplitButton>,
    );
    expect(screen.getByRole("button", {name: "Save"})).toBeInTheDocument();
    const menuBtn = screen.getByRole("button", {name: "More options"});
    expect(menuBtn).toHaveAttribute("aria-haspopup", "menu");
    expect(menuBtn).toHaveAttribute("aria-expanded", "false");
  });

  it("opens a portaled menu that escapes an overflow ancestor", () => {
    render(
      <div data-testid="clip" style={{overflow: "hidden"}}>
        <SplitButton menu={<SplitButton.Item>One</SplitButton.Item>}>
          Save
        </SplitButton>
      </div>,
    );
    const menuBtn = screen.getByRole("button", {name: "More options"});
    fireEvent.click(menuBtn);
    expect(menuBtn).toHaveAttribute("aria-expanded", "true");
    const menu = screen.getByRole("menu");
    // Rendered in a portal on <body>, not inside the clipping container.
    expect(screen.getByTestId("clip")).not.toContainElement(menu);
  });

  it("returns focus to the trailing button on Escape", () => {
    render(
      <SplitButton menu={<SplitButton.Item>One</SplitButton.Item>}>
        Save
      </SplitButton>,
    );
    const menuBtn = screen.getByRole("button", {name: "More options"});
    fireEvent.click(menuBtn);
    fireEvent.keyDown(screen.getByRole("menu"), {key: "Escape"});
    expect(menuBtn).toHaveFocus();
  });

  it("has no accessibility violations when closed", async () => {
    const {container} = render(
      <SplitButton menu={<SplitButton.Item>One</SplitButton.Item>}>
        Save
      </SplitButton>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
