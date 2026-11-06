import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // `.vercel/**` is not decoration: running `vercel build` locally writes
  // `.vercel/output` — minified chunks that ESLint then reads as source, and reports
  // 2,300 problems from. Nothing under it is hand-written.
  globalIgnores([
    ".next/**",
    ".vercel/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
  ]),
]);

