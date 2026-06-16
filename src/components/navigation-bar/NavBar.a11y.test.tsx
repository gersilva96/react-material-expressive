import {render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {describe, expect, it} from "vitest";
import {NavigationBar} from "./NavigationBar";

describe("NavigationBar.Item accessibility", () => {
  it("names an icon-only item via aria-label", () => {
    render(
      <NavigationBar>
        <NavigationBar.Item
          aria-label="Home"
          icon={<svg aria-hidden viewBox="0 0 24 24" />}
        />
      </NavigationBar>,
    );
    expect(screen.getByRole("button", {name: "Home"})).toBeInTheDocument();
  });

  it("renders two destinations", () => {
    render(
      <NavigationBar>
        <NavigationBar.Item
          aria-label="Home"
          icon={<svg aria-hidden viewBox="0 0 24 24" />}
        />
        <NavigationBar.Item
          aria-label="Profile"
          icon={<svg aria-hidden viewBox="0 0 24 24" />}
        />
      </NavigationBar>,
    );
    expect(screen.getByRole("button", {name: "Home"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Profile"})).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const {container} = render(
      <NavigationBar>
        <NavigationBar.Item
          aria-label="Home"
          icon={<svg aria-hidden viewBox="0 0 24 24" />}
        />
        <NavigationBar.Item
          aria-label="Profile"
          icon={<svg aria-hidden viewBox="0 0 24 24" />}
        />
      </NavigationBar>,
    );
    expect(
      await axe(container, {
        rules: {"color-contrast": {enabled: false}},
      }),
    ).toHaveNoViolations();
  });
});
