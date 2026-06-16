import {render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {describe, expect, it} from "vitest";
import {InputFilled} from "./InputFilled";
import {InputOutlined} from "./InputOutlined";

const fields = [
  {name: "InputFilled", Component: InputFilled},
  {name: "InputOutlined", Component: InputOutlined},
] as const;

describe.each(fields)("$name", ({Component}) => {
  it("renders the labelled input", () => {
    render(<Component label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("links supporting text via aria-describedby", () => {
    render(<Component label="Email" supportingText="Helper" />);
    const input = screen.getByLabelText("Email");
    const helper = screen.getByText("Helper");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(describedBy!.split(" ")).toContain(helper.id);
  });

  it("marks the error and exposes it via role=alert", () => {
    render(<Component label="Email" error errorText="Bad" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Bad");
    expect(input.getAttribute("aria-describedby")!.split(" ")).toContain(
      alert.id,
    );
  });

  it("merges a consumer-supplied aria-describedby", () => {
    render(
      <Component
        aria-describedby="external-id"
        label="Email"
        supportingText="Helper"
      />,
    );
    const input = screen.getByLabelText("Email");
    const helper = screen.getByText("Helper");
    const ids = input.getAttribute("aria-describedby")!.split(" ");
    expect(ids).toContain("external-id");
    expect(ids).toContain(helper.id);
  });
});

describe("TextField a11y", () => {
  it("has no accessibility violations", async () => {
    const {container} = render(
      <InputOutlined label="Email" supportingText="Helper" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
