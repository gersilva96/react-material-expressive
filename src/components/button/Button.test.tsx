import {render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {describe, expect, it} from "vitest";
import {Button} from "./Button";

describe("Button", () => {
  it("renders its label as a button", () => {
    render(<Button>Accept</Button>);
    expect(screen.getByRole("button", {name: "Accept"})).toBeInTheDocument();
  });

  it("defaults to type=button to avoid accidental form submits", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("exposes aria-pressed when used as a toggle", () => {
    render(<Button selected>Bold</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("does not set aria-pressed when not a toggle", () => {
    render(<Button>Plain</Button>);
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-pressed");
  });

  it("has no accessibility violations", async () => {
    const {container} = render(<Button>Accept</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
