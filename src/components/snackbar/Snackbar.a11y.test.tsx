import {render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {describe, expect, it} from "vitest";
import {Snackbar} from "./Snackbar";

describe("Snackbar a11y", () => {
  it("renders the message inside a polite live region", () => {
    render(<Snackbar isVisible text="Photo archived" />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Photo archived");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-atomic", "true");
  });

  it("names the dismiss button via labels", () => {
    render(
      <Snackbar
        isVisible
        labels={{dismiss: "Descartar"}}
        onClose={() => {}}
        showClose
        text="Photo archived"
      />,
    );
    expect(screen.getByRole("button", {name: "Descartar"})).toBeInTheDocument();
  });

  it("defaults the dismiss button accessible name to Dismiss", () => {
    render(<Snackbar isVisible onClose={() => {}} showClose text="Saved" />);
    expect(screen.getByRole("button", {name: "Dismiss"})).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const {container} = render(
      <Snackbar isVisible onClose={() => {}} showClose text="Photo archived" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
