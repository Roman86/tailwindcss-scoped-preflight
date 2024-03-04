import { matchedOnly, scopedPreflightStyles } from "../dist/plugin.esm";

module.exports = {
  content: ["**/*.html"],
  plugins: [
    scopedPreflightStyles({
      cssSelector: matchedOnly(".twp", {
        // skipping and removing these selectors makes no sense, but just for a test
        remove: ["html", ":host", "*"],
        ignore: ["body", ":before"],
      }),
      // or make your own rules transformation
      // cssSelector: (selector) =>
      //   selector === "*"
      //     ? "" // removes the rule (for particular selector only)
      //     : ["html", ":host"].includes(selector)
      //       ? selector // keeps the original selector
      //       : matchedOnly(".twp")(selector), // generates a new selector with selected behaviour (matchedOnly mode)

      // it's also possible to filter out some properties
      cssRulePropsFilter: ({ selectorSet, property }) =>
        !(selectorSet.has("body") && property === "line-height"), // removes line-height reset from body
    }),
  ],
  theme: {
    fontFamily: {
      display: ["Oswald"],
      body: ['"Open Sans"'],
    },
  },
};
