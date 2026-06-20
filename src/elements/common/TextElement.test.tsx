import {render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {describe, expect, it} from "vitest";
import {TextElement} from "./TextElement";

describe("TextElement", () => {
  it("renders a single slot directly without a wrapper div", () => {
    const {container} = render(<TextElement title="Headline" />);
    expect(container.firstChild?.nodeName).toBe("H2");
    expect(container.querySelector("div")).toBeNull();
    expect(screen.getByRole("heading", {level: 2})).toHaveTextContent(
      "Headline",
    );
  });

  it("respects a per-slot element override", () => {
    render(<TextElement title="Headline" titleAs="h1" />);
    expect(screen.getByRole("heading", {level: 1})).toHaveTextContent(
      "Headline",
    );
  });

  it("renders a non-heading element when asked", () => {
    const {container} = render(<TextElement label="Overline" labelAs="span" />);
    expect(container.firstChild?.nodeName).toBe("SPAN");
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("wraps multiple slots in the flex container", () => {
    const {container} = render(
      <TextElement body="Body" label="Overline" title="Headline" />,
    );
    expect(container.firstChild?.nodeName).toBe("DIV");
    expect(screen.getByText("Overline")).toBeInTheDocument();
    expect(screen.getByRole("heading", {level: 2})).toHaveTextContent(
      "Headline",
    );
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("puts className on the bare element with a single slot", () => {
    const {container} = render(<TextElement className="custom" title="Hi" />);
    expect(container.firstChild?.nodeName).toBe("H2");
    expect(container.firstChild).toHaveClass("custom");
  });

  it("puts className on the wrapper with multiple slots, and honors `as`", () => {
    const {container} = render(
      <TextElement as="section" body="B" className="custom" title="T" />,
    );
    expect(container.firstChild?.nodeName).toBe("SECTION");
    expect(container.firstChild).toHaveClass("custom");
  });

  it("has no accessibility violations", async () => {
    const {container} = render(
      <TextElement body="Body" label="Overline" title="Headline" />,
    );
    expect(
      await axe(container, {rules: {"color-contrast": {enabled: false}}}),
    ).toHaveNoViolations();
  });
});
