import {fireEvent, render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {useState} from "react";
import {describe, expect, it, vi} from "vitest";
import {SearchInput} from "./SearchInput";

describe("SearchInput", () => {
  it("renders a search input with the default placeholder", () => {
    render(<SearchInput />);
    expect(screen.getByRole("searchbox")).toHaveAttribute(
      "placeholder",
      "Search",
    );
  });

  it("does not render a clear button without `clearable`", () => {
    render(<SearchInput defaultValue="hello" />);
    expect(
      screen.queryByRole("button", {name: "Clear"}),
    ).not.toBeInTheDocument();
  });

  it("does not render the clear button when there is no value", () => {
    render(<SearchInput clearable />);
    expect(
      screen.queryByRole("button", {name: "Clear"}),
    ).not.toBeInTheDocument();
  });

  it("clears an uncontrolled value, refocuses, and fires onClear", () => {
    const onClear = vi.fn();
    render(<SearchInput clearable defaultValue="hello" onClear={onClear} />);
    const input = screen.getByRole("searchbox");
    fireEvent.click(screen.getByRole("button", {name: "Clear"}));
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("clears a controlled value through its onChange", () => {
    const onChange = vi.fn();
    function Controlled() {
      const [v, setV] = useState("hi");
      return (
        <SearchInput
          clearable
          onChange={(e) => {
            onChange(e.target.value);
            setV(e.target.value);
          }}
          value={v}
        />
      );
    }
    render(<Controlled />);
    const input = screen.getByRole("searchbox");
    expect(input).toHaveValue("hi");
    fireEvent.click(screen.getByRole("button", {name: "Clear"}));
    expect(input).toHaveValue("");
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("lets rightElement take precedence over the clear button", () => {
    render(
      <SearchInput
        clearable
        defaultValue="hello"
        rightElement={<span>avatar</span>}
      />,
    );
    expect(
      screen.queryByRole("button", {name: "Clear"}),
    ).not.toBeInTheDocument();
    expect(screen.getByText("avatar")).toBeInTheDocument();
  });

  it("uses the labels.clear accessible name", () => {
    render(
      <SearchInput clearable defaultValue="x" labels={{clear: "Limpiar"}} />,
    );
    expect(screen.getByRole("button", {name: "Limpiar"})).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const {container} = render(<SearchInput clearable defaultValue="hello" />);
    expect(
      await axe(container, {rules: {"color-contrast": {enabled: false}}}),
    ).toHaveNoViolations();
  });
});
