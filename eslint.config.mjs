import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "warn",
      "no-multiple-empty-lines": ["error", { max: 1 }],
      "semi": ["warn", "always"],
      "quotes": ["warn", "double"],
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
];
