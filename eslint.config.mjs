import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const eslintConfig = defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@next/next/no-html-link-for-pages": "off",
      "react/no-unescaped-entities": "off",
    },
  },
  globalIgnores([
    ".claude/**",
    ".codex/**",
    ".next_old_v2/**",
    ".planning/**",
    ".next/**",
    "docs/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/**",
    "src/scripts/**",
  ]),
]);

export default eslintConfig;
