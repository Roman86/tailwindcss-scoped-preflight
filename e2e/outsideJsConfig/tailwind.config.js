import { scopedPreflightStyles } from "../../dist/index.js";

/** @type {import('tailwindcss').Config} */
export default {
  plugins: [
    scopedPreflightStyles({
      isolationStrategy: "outside",
      selector: ".no-twp",
      plus: ".twp",
    }),
  ],
};
