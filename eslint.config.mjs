import { globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  globalIgnores([
    ".next*/**",
    "node_modules*/**",
    "cdk.out/**",
    "tmp/**",
    "tasks/video_frames/**",
    "next-env.d.ts",
    "extract_all_page.js",
    "extract_old_files.js",
    "restore_files.js"
  ]),
  ...nextVitals,
  {
    rules: {
      "react/no-unescaped-entities": "off"
    }
  }
];

export default eslintConfig;
