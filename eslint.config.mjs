import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

// Flat Config ersetzt .eslintrc.json ("next/core-web-vitals"); next lint gibt es ab Next.js 16 nicht mehr.
export default defineConfig([
  ...nextVitals,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
