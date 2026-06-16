import {render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {describe, expect, it} from "vitest";
import {SelectFilled} from "./SelectFilled";

const options = [{value: "a", label: "A"}];

describe("SelectFilled a11y", () => {
  it("renders a combobox", () => {
    render(<SelectFilled label="Pick" options={options} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("links the combobox to its supporting text via aria-describedby", () => {
    render(
      <SelectFilled label="Pick" options={options} supportingText="Pick one" />,
    );
    const combobox = screen.getByRole("combobox");
    const describedBy = combobox.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const support = document.getElementById(describedBy!);
    expect(support).not.toBeNull();
    expect(support!.tagName).toBe("P");
    expect(support).toHaveTextContent("Pick one");
  });

  it("does not set aria-describedby without supporting or error text", () => {
    render(<SelectFilled label="Pick" options={options} />);
    expect(screen.getByRole("combobox")).not.toHaveAttribute(
      "aria-describedby",
    );
  });

  it("exposes aria-invalid and the error message when in error", () => {
    render(
      <SelectFilled
        error
        errorText="Required"
        label="Pick"
        options={options}
      />,
    );
    const combobox = screen.getByRole("combobox");
    expect(combobox).toHaveAttribute("aria-invalid", "true");
    const describedBy = combobox.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const support = document.getElementById(describedBy!);
    expect(support).toHaveTextContent("Required");
  });

  it("has no accessibility violations", async () => {
    const {container} = render(
      <SelectFilled label="Pick" options={options} supportingText="Pick one" />,
    );
    expect(
      await axe(container, {
        rules: {"color-contrast": {enabled: false}},
      }),
    ).toHaveNoViolations();
  });
});
