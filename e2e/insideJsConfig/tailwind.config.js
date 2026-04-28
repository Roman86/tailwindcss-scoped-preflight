import { scopedPreflightStyles } from "../../dist/index.js";

/** @type {import('tailwindcss').Config} */
export default {
  plugins: [
    scopedPreflightStyles({
      isolationStrategy: "inside",
      selector: ".twp",
      except: ".no-twp",
    }),
  ],
};
