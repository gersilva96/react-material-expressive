import {defineConfig} from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  clean: false,
  external: ["react", "react-dom", "react/jsx-runtime"],
  outExtension({format}) {
    return {js: format === "cjs" ? ".cjs" : ".js"};
  },
});
