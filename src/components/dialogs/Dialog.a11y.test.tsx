import {render, screen} from "@testing-library/react";
import {axe} from "jest-axe";
import {describe, expect, it} from "vitest";
import {Dialog} from "./Dialog";

describe("Dialog a11y", () => {
  it("renders a dialog named by the label prop", () => {
    render(
      <Dialog isVisible label="Settings" onClose={() => {}}>
        <p>Body</p>
      </Dialog>,
    );
    expect(screen.getByRole("dialog", {name: "Settings"})).toBeInTheDocument();
  });

  it("is named by the Dialog.Header headline via aria-labelledby", async () => {
    render(
      <Dialog isVisible label="Settings" onClose={() => {}}>
        <Dialog.Header headline="Title" />
        <p>Body</p>
      </Dialog>,
    );
    // The header effect flips the dialog from aria-label to
    // aria-labelledby on mount, so wait a tick for it to apply.
    expect(
      await screen.findByRole("dialog", {name: "Title"}),
    ).toBeInTheDocument();
  });

  it("moves focus into the panel on open", () => {
    render(
      <Dialog isVisible label="Settings" onClose={() => {}}>
        <p>Body</p>
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("has no accessibility violations", async () => {
    const {container} = render(
      <Dialog isVisible label="Settings" onClose={() => {}}>
        <Dialog.Header headline="Title" />
        <p>Body</p>
      </Dialog>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
