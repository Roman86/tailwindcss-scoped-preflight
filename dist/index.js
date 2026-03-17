var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/index.ts
import { readFileSync } from "fs";
import { createRequire } from "module";
import postcss from "postcss";
import TailwindPlugin from "tailwindcss/plugin.js";

// src/strategies.ts
var optionsHandlerForIgnoreAndRemove = (selector, { ignore, remove } = {}) => {
  if ((remove == null ? void 0 : remove.some((s) => selector.includes(s))) === true) {
    return "";
  }
  if ((ignore == null ? void 0 : ignore.some((s) => selector.includes(s))) === true) {
    return selector;
  }
  return null;
};
var roots = /* @__PURE__ */ new Set(["html", "body", ":host"]);
function isRootSelector(selector) {
  return roots.has(selector);
}
function isBeforeOrAfter(ruleSelector) {
  return ruleSelector.includes("::before") || ruleSelector.includes("::after");
}
function isPseudoElementSelector(ruleSelector) {
  return ruleSelector.includes("::");
}
var isolateInsideOfContainer = (containerSelectors, options) => {
  const whereNotExcept = typeof (options == null ? void 0 : options.except) === "string" && options.except ? `:where(:not(${options.except},${options.except} *))` : "";
  const selectorsArray = [containerSelectors].flat();
  const whereDirect = `:where(${selectorsArray.join(",")})`;
  const whereWithSubs = `:where(${selectorsArray.map((s) => `${s},${s} *`).join(",")})`;
  return ({ ruleSelector }) => {
    const handled = optionsHandlerForIgnoreAndRemove(ruleSelector, options);
    if (handled != null) {
      return handled;
    }
    if (isRootSelector(ruleSelector)) {
      if ((options == null ? void 0 : options.rootStyles) === "add :where") {
        return `${ruleSelector}${whereNotExcept} ${whereDirect}`;
      }
      return selectorsArray.map((s) => `${s}${whereNotExcept}`).join(",");
    } else if (isBeforeOrAfter(ruleSelector)) {
      return `${whereWithSubs}${whereNotExcept}${ruleSelector}`;
    } else if (isPseudoElementSelector(ruleSelector)) {
      return `${whereWithSubs}${whereNotExcept} ${ruleSelector}`;
    } else {
      return `${ruleSelector}${whereWithSubs}${whereNotExcept}`;
    }
  };
};
var isolateOutsideOfContainer = (containerSelectors, options) => {
  const whereNotContainerSelector = `:where(:not(${[containerSelectors].flat().map((s) => `${s},${s} *`).join(",")}))`;
  const insideOfContainerLogic = typeof (options == null ? void 0 : options.plus) === "string" && options.plus ? isolateInsideOfContainer(options.plus) : null;
  return ({ ruleSelector, ...rest }) => {
    const ignoreOrRemove = optionsHandlerForIgnoreAndRemove(ruleSelector, options);
    if (ignoreOrRemove != null) {
      return ignoreOrRemove;
    }
    if (isRootSelector(ruleSelector)) {
      return ruleSelector;
    }
    return [
      isBeforeOrAfter(ruleSelector) ? `${whereNotContainerSelector}${ruleSelector}` : isPseudoElementSelector(ruleSelector) ? `${whereNotContainerSelector} ${ruleSelector}` : `${ruleSelector}${whereNotContainerSelector}`,
      insideOfContainerLogic == null ? void 0 : insideOfContainerLogic({ ruleSelector, ...rest })
    ].filter(Boolean).join(",");
  };
};
var isolateForComponents = (componentSelectors, options) => {
  const componentSelectorsArray = [componentSelectors].flat();
  const whereComponentSelectorsDirect = `:where(${componentSelectorsArray.join(",")})`;
  const whereComponentSelectorsWithSubs = `:where(${componentSelectorsArray.map((s) => `${s},${s} *`).join(",")})`;
  return ({ ruleSelector }) => optionsHandlerForIgnoreAndRemove(ruleSelector, options) ?? (isRootSelector(ruleSelector) ? `${ruleSelector} ${whereComponentSelectorsDirect}` : `${ruleSelector}${whereComponentSelectorsWithSubs}`);
};

// src/index.ts
var req = typeof __require !== "undefined" ? __require : createRequire(import.meta.url);
var { withOptions } = TailwindPlugin;
var scopedPreflightStyles = withOptions(
  ({ isolationStrategy, propsFilter, modifyPreflightStyles }) => ({ addBase, corePlugins }) => {
    const baseCssPath = req.resolve("tailwindcss/lib/css/preflight.css");
    const baseCssStyles = postcss.parse(readFileSync(baseCssPath, "utf8"));
    if (typeof isolationStrategy !== "function") {
      throw new Error(
        "TailwindCssScopedPreflightPlugin: isolationStrategy option must be a function - custom one or pre-bundled - import { isolateInsideOfContainer, isolateOutsideOfContainer, isolateForComponents } from 'tailwindcss-scoped-preflight-plugin')"
      );
    }
    if (corePlugins("preflight")) {
      throw new Error(
        `TailwindCssScopedPreflightPlugin: TailwindCSS corePlugins.preflight config option must be set to false`
      );
    }
    let modifyStylesHook;
    if (typeof modifyPreflightStyles === "function") {
      modifyStylesHook = modifyPreflightStyles;
    } else if (modifyPreflightStyles) {
      const configEntries = Object.entries(modifyPreflightStyles);
      modifyStylesHook = ({ selectorSet, property, value }) => {
        var _a;
        const matchingEntry = configEntries.find(([sel]) => selectorSet.has(sel));
        return (_a = matchingEntry == null ? void 0 : matchingEntry[1]) == null ? void 0 : _a[property];
      };
    }
    baseCssStyles.walkRules((rule) => {
      var _a;
      if (propsFilter || modifyPreflightStyles) {
        const selectorSet = new Set(rule.selectors);
        rule.nodes = (_a = rule.nodes) == null ? void 0 : _a.map((node) => {
          if (node instanceof postcss.Declaration) {
            const newValue = modifyStylesHook ? modifyStylesHook({
              selectorSet,
              property: node.prop,
              value: node.value
            }) : node.value;
            const filterValue = propsFilter ? propsFilter({
              selectorSet,
              property: node.prop,
              value: node.value
            }) : true;
            if (filterValue === false || newValue === null) {
              return postcss.comment({
                text: node.toString()
              });
            } else if (typeof newValue !== "undefined" && newValue !== node.value) {
              node.value = newValue;
            }
          }
          return node;
        });
      }
      rule.selectors = rule.selectors.map((s) => isolationStrategy({ ruleSelector: s })).filter((value, index, array) => value && array.indexOf(value) === index);
      rule.selector = rule.selectors.join(",\n");
      if (!rule.nodes.some((n) => n instanceof postcss.Declaration)) {
        rule.nodes = [];
      }
    });
    addBase(
      baseCssStyles.nodes.filter((node, i, all) => {
        const next = all[i + 1];
        return node instanceof postcss.Rule ? node.nodes.length > 0 && node.selector : node instanceof postcss.Comment ? next instanceof postcss.Rule && next.selector && next.nodes.length > 0 : true;
      })
    );
  },
  () => ({
    corePlugins: {
      preflight: false
    }
  })
);
export {
  isolateForComponents,
  isolateInsideOfContainer,
  isolateOutsideOfContainer,
  scopedPreflightStyles
};
