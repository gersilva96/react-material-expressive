import {fireEvent, render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {describe, expect, it} from "vitest";
import {Dropdown} from "./Dropdown";

describe("Dropdown", () => {
  it("renders the trigger", () => {
    render(
      <Dropdown menu={<Dropdown.Item>One</Dropdown.Item>}>
        <button type="button">Open</button>
      </Dropdown>,
    );
    expect(screen.getByRole("button", {name: "Open"})).toBeInTheDocument();
  });

  it("marks the trigger as a collapsed menu button", () => {
    render(
      <Dropdown menu={<Dropdown.Item>One</Dropdown.Item>}>
        <button type="button">Open</button>
      </Dropdown>,
    );
    const trigger = screen.getByRole("button", {name: "Open"});
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("expands and reveals a menu when clicked", () => {
    render(
      <Dropdown menu={<Dropdown.Item>One</Dropdown.Item>}>
        <button type="button">Open</button>
      </Dropdown>,
    );
    const trigger = screen.getByRole("button", {name: "Open"});
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("has no accessibility violations when closed", async () => {
    const {container} = render(
      <Dropdown menu={<Dropdown.Item>One</Dropdown.Item>}>
        <button type="button">Open</button>
      </Dropdown>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
