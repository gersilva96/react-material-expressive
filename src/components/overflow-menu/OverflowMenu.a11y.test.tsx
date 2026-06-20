import {fireEvent, render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {describe, expect, it} from "vitest";
import {OverflowMenu} from "./OverflowMenu";

describe("OverflowMenu", () => {
  it("marks the trigger as a collapsed menu button", () => {
    render(
      <OverflowMenu menu={<OverflowMenu.Item>One</OverflowMenu.Item>}>
        <button type="button">More</button>
      </OverflowMenu>,
    );
    const trigger = screen.getByRole("button", {name: "More"});
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("opens a portaled menu that escapes an overflow ancestor", () => {
    render(
      <div data-testid="clip" style={{overflow: "hidden"}}>
        <OverflowMenu menu={<OverflowMenu.Item>One</OverflowMenu.Item>}>
          <button type="button">More</button>
        </OverflowMenu>
      </div>,
    );
    const trigger = screen.getByRole("button", {name: "More"});
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const menu = screen.getByRole("menu");
    expect(screen.getByTestId("clip")).not.toContainElement(menu);
  });

  it("opens above the trigger for a top placement", () => {
    render(
      <OverflowMenu menu={<OverflowMenu.Item>One</OverflowMenu.Item>} topRight>
        <button type="button">More</button>
      </OverflowMenu>,
    );
    fireEvent.click(screen.getByRole("button", {name: "More"}));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("has no accessibility violations when closed", async () => {
    const {container} = render(
      <OverflowMenu menu={<OverflowMenu.Item>One</OverflowMenu.Item>}>
        <button type="button">More</button>
      </OverflowMenu>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
