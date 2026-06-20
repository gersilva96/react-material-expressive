import {fireEvent, render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {describe, expect, it, vi} from "vitest";
import {ComboboxOutlined} from "./ComboboxOutlined";

const options = [
  {label: "Apple", value: "apple"},
  {label: "Banana", value: "banana"},
];

describe("Combobox a11y", () => {
  it("renders an ARIA combobox input, collapsed", () => {
    render(<ComboboxOutlined label="Fruit" options={options} />);
    const combobox = screen.getByRole("combobox");
    // No onInputChange wired → a static option popover, not list-autocomplete.
    expect(combobox).toHaveAttribute("aria-autocomplete", "none");
    expect(combobox).toHaveAttribute("aria-expanded", "false");
  });

  it("advertises list autocomplete only when onInputChange is wired", () => {
    render(
      <ComboboxOutlined
        label="Fruit"
        onInputChange={() => {}}
        options={options}
      />,
    );
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-autocomplete",
      "list",
    );
  });

  it("links supporting text and error via aria-describedby / aria-invalid", () => {
    const {rerender} = render(
      <ComboboxOutlined label="Fruit" options={options} supportingText="Hint" />,
    );
    let combobox = screen.getByRole("combobox");
    const describedBy = combobox.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent("Hint");

    rerender(
      <ComboboxOutlined error errorText="Required" label="Fruit" options={options} />,
    );
    combobox = screen.getByRole("combobox");
    expect(combobox).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
  });

  it("opens on typing and notifies the consumer to re-query", () => {
    const onInputChange = vi.fn();
    render(
      <ComboboxOutlined
        label="Fruit"
        onInputChange={onInputChange}
        options={options}
      />,
    );
    const combobox = screen.getByRole("combobox");
    fireEvent.change(combobox, {target: {value: "ap"}});
    expect(onInputChange).toHaveBeenCalledWith("ap");
    expect(combobox).toHaveAttribute("aria-expanded", "true");
    const listbox = screen.getByRole("listbox");
    expect(combobox.getAttribute("aria-controls")).toBe(listbox.id);
  });

  it("portals the listbox and commits a clicked option to the input", () => {
    const onChange = vi.fn();
    render(
      <div data-testid="clip" style={{overflow: "hidden"}}>
        <ComboboxOutlined label="Fruit" onChange={onChange} options={options} />
      </div>,
    );
    const combobox = screen.getByRole("combobox");
    fireEvent.keyDown(combobox, {key: "ArrowDown"});
    const listbox = screen.getByRole("listbox");
    expect(screen.getByTestId("clip")).not.toContainElement(listbox);

    fireEvent.click(screen.getByRole("option", {name: "Banana"}));
    expect(onChange).toHaveBeenCalledWith("banana");
    expect(combobox).toHaveValue("Banana");
    expect(combobox).toHaveAttribute("aria-expanded", "false");
  });

  it("moves the active option with the arrows and commits on Enter", () => {
    const onChange = vi.fn();
    render(<ComboboxOutlined label="Fruit" onChange={onChange} options={options} />);
    const combobox = screen.getByRole("combobox");
    fireEvent.keyDown(combobox, {key: "ArrowDown"}); // open, highlight Apple
    fireEvent.keyDown(combobox, {key: "ArrowDown"}); // -> Banana
    expect(combobox.getAttribute("aria-activedescendant")).toBeTruthy();
    fireEvent.keyDown(combobox, {key: "Enter"});
    expect(onChange).toHaveBeenCalledWith("banana");
  });

  it("reverts the input text to the selected label on Escape", () => {
    render(<ComboboxOutlined defaultValue="apple" label="Fruit" options={options} />);
    const combobox = screen.getByRole("combobox");
    expect(combobox).toHaveValue("Apple");
    fireEvent.change(combobox, {target: {value: "xyz"}});
    expect(combobox).toHaveValue("xyz");
    fireEvent.keyDown(combobox, {key: "Escape"});
    expect(combobox).toHaveValue("Apple");
    expect(combobox).toHaveAttribute("aria-expanded", "false");
  });

  it("clears the value with the clear button", () => {
    const onChange = vi.fn();
    render(
      <ComboboxOutlined
        defaultValue="apple"
        label="Fruit"
        onChange={onChange}
        options={options}
      />,
    );
    const combobox = screen.getByRole("combobox");
    expect(combobox).toHaveValue("Apple");
    fireEvent.click(screen.getByRole("button", {name: "Clear"}));
    expect(onChange).toHaveBeenCalledWith("");
    expect(combobox).toHaveValue("");
  });

  it("shows a loading status row while fetching", () => {
    render(<ComboboxOutlined label="Fruit" loading options={[]} />);
    fireEvent.keyDown(screen.getByRole("combobox"), {key: "ArrowDown"});
    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
  });

  it("shows an empty status row when there are no options", () => {
    render(<ComboboxOutlined label="Fruit" options={[]} />);
    fireEvent.keyDown(screen.getByRole("combobox"), {key: "ArrowDown"});
    expect(screen.getByRole("status")).toHaveTextContent("No results");
  });

  it("has no accessibility violations, closed and open", async () => {
    const {container} = render(
      <ComboboxOutlined label="Fruit" options={options} supportingText="Hint" />,
    );
    const rules = {"color-contrast": {enabled: false}};
    expect(await axe(container, {rules})).toHaveNoViolations();
    fireEvent.keyDown(screen.getByRole("combobox"), {key: "ArrowDown"});
    // `region` is a page-structure (landmark) rule, irrelevant when scanning
    // the whole body for the portaled listbox in a unit test.
    expect(
      await axe(document.body, {rules: {...rules, region: {enabled: false}}}),
    ).toHaveNoViolations();
  });
});
