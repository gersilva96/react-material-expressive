// Post-build assets step:
// 1. Copies src/theme.css RAW to dist/theme.css — a Tailwind v4 partial
//    (@theme) published for consumers running their own Tailwind v4.
// 2. Stamps the "use client" directive on the package entry. tsup's banner
//    option does not survive esbuild in this setup, so the directive is added
//    deterministically here.
import {copyFileSync, readFileSync, writeFileSync} from "node:fs";
import {join} from "node:path";

const DIST = "dist";
const ENTRIES = ["index"];

copyFileSync("src/theme.css", join(DIST, "theme.css"));

const DIRECTIVE = '"use client";';
let stamped = 0;
for (const entry of ENTRIES) {
  for (const ext of [".js", ".cjs"]) {
    const file = join(DIST, entry + ext);
    const code = readFileSync(file, "utf8");
    if (!code.startsWith(DIRECTIVE) && !code.startsWith("'use client'")) {
      writeFileSync(file, `${DIRECTIVE}\n${code}`);
      stamped++;
    }
  }
}

console.log(
  `[copy-themes] theme.css copied, "use client" stamped on ${stamped} entries`,
);
