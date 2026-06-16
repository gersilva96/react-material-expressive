import {fireEvent, render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {describe, expect, it} from "vitest";
import {Tooltip} from "./Tooltip";

describe("Tooltip a11y", () => {
  it("renders the trigger and the tooltip text", () => {
    render(
      <Tooltip text="Save to favorites">
        <button type="button">Fav</button>
      </Tooltip>,
    );
    expect(screen.getByRole("button", {name: "Fav"})).toBeInTheDocument();
    expect(screen.getByRole("tooltip")).toHaveTextContent("Save to favorites");
  });

  it("describes the trigger via aria-describedby pointing at the tooltip", () => {
    render(
      <Tooltip text="Save to favorites">
        <button type="button">Fav</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", {name: "Fav"});
    const tooltip = screen.getByRole("tooltip");

    const described = trigger.getAttribute("aria-describedby");
    expect(described).toBeTruthy();
    expect(described!.split(" ")).toContain(tooltip.id);
    expect(tooltip).toHaveTextContent("Save to favorites");
  });

  it("preserves an existing aria-describedby on the trigger", () => {
    render(
      <Tooltip text="Save to favorites">
        <button aria-describedby="x" type="button">
          Fav
        </button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", {name: "Fav"});
    const tooltip = screen.getByRole("tooltip");

    const ids = trigger.getAttribute("aria-describedby")!.split(" ");
    expect(ids).toContain("x");
    expect(ids).toContain(tooltip.id);
  });

  it("toggles the wrapper data-dismissed attribute on Escape", () => {
    const {container} = render(
      <Tooltip text="Save to favorites">
        <button type="button">Fav</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", {name: "Fav"});
    const wrapper = container.querySelector(".group")!;

    expect(wrapper).not.toHaveAttribute("data-dismissed");
    fireEvent.keyDown(trigger, {key: "Escape"});
    expect(wrapper).toHaveAttribute("data-dismissed");
  });

  it("has no accessibility violations", async () => {
    const {container} = render(
      <Tooltip text="Save to favorites">
        <button type="button">Fav</button>
      </Tooltip>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
