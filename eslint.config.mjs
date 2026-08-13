import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  { files: ["app/customer-access/page.tsx"], rules: { "react-hooks/set-state-in-effect": "off" } },
  { files: ["app/quote-issuance/page.tsx"], rules: { "react-hooks/purity": "off" } },
  { files: ["app/customer-quotes/page.tsx"], rules: { "@next/next/no-img-element": "off" } },
  { files: ["app/api/v4/customer-installations/completion-pdf/route.ts"], rules: { "prefer-const": "off" } },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
