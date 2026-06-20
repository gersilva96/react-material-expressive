import {render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {describe, expect, it} from "vitest";
import {DatePicker} from "./DatePicker";

describe("DatePicker a11y", () => {
  it("renders the dialog with day buttons", async () => {
    render(<DatePicker isVisible onClose={() => {}} />);
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    // Smoke: month grid renders selectable day buttons (e.g. the 15th).
    expect(screen.getByRole("button", {name: /15/})).toBeInTheDocument();
  });

  it("names the dialog by its supporting line", async () => {
    render(<DatePicker isVisible onClose={() => {}} />);
    const dialog = await screen.findByRole("dialog", {
      name: /select date/i,
    });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAccessibleName();
  });

  it("does not expose role=grid in the calendar", () => {
    render(<DatePicker isVisible onClose={() => {}} />);
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const {container} = render(<DatePicker isVisible onClose={() => {}} />);
    await screen.findByRole("dialog");
    expect(
      await axe(container, {
        rules: {"color-contrast": {enabled: false}},
      }),
    ).toHaveNoViolations();
  });
});

describe("DatePicker error state", () => {
  it("marks the docked field invalid and exposes the error message", () => {
    render(<DatePicker.Docked error errorText="Required" />);
    const field = screen.getByLabelText("Date");
    expect(field).toHaveAttribute("aria-invalid", "true");
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Required");
    expect(field.getAttribute("aria-describedby")!.split(" ")).toContain(
      alert.id,
    );
  });

  it("shows docked supporting text when not in error", () => {
    render(<DatePicker.Docked supportingText="MM/DD/YYYY" />);
    expect(screen.getByText("MM/DD/YYYY")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
