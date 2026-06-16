// Internal: lets Dialog give Dialog.Header (or a picker header) a stable id so
// the panel can name itself via aria-labelledby (matches @material/web, which
// labels the dialog by its headline). `setLabelled` lets the header tell the
// dialog an element actually carries that id, so the dialog only applies
// aria-labelledby when it resolves (a dangling IDREF yields no name and does
// NOT fall back to aria-label). Not exported from public barrels.
import {createContext} from "react";

export const DialogContext = createContext<{
  headlineId?: string;
  setLabelled?: (labelled: boolean) => void;
}>({});
