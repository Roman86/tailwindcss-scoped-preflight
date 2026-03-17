"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  isolateForComponents: () => isolateForComponents,
  isolateInsideOfContainer: () => isolateInsideOfContainer,
  isolateOutsideOfContainer: () => isolateOutsideOfContainer,
  scopedPreflightStyles: () => scopedPreflightStyles
});
module.exports = __toCommonJS(index_exports);
var import_plugin = __toESM(require("tailwindcss/plugin.js"), 1);
var import_postcss = __toESM(require("postcss"), 1);
var import_fs = require("fs");
var import_module = require("module");

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
var roots = /* @__PURE__ */ new Set([
  "html",
  "body",
  ":host"
]);
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
var import_meta = {};
var req = typeof require !== "undefined" ? require : (0, import_module.createRequire)(import_meta.url);
var { withOptions } = import_plugin.default;
var scopedPreflightStyles = withOptions(
  ({ isolationStrategy, propsFilter, modifyPreflightStyles }) => ({ addBase, corePlugins }) => {
    const baseCssPath = req.resolve("tailwindcss/lib/css/preflight.css");
    const baseCssStyles = import_postcss.default.parse((0, import_fs.readFileSync)(baseCssPath, "utf8"));
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
          if (node instanceof import_postcss.default.Declaration) {
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
              return import_postcss.default.comment({
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
      if (!rule.nodes.some((n) => n instanceof import_postcss.default.Declaration)) {
        rule.nodes = [];
      }
    });
    addBase(
      baseCssStyles.nodes.filter((node, i, all) => {
        const next = all[i + 1];
        return node instanceof import_postcss.default.Rule ? node.nodes.length > 0 && node.selector : node instanceof import_postcss.default.Comment ? next instanceof import_postcss.default.Rule && next.selector && next.nodes.length > 0 : true;
      })
    );
  },
  () => ({
    corePlugins: {
      preflight: false
    }
  })
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isolateForComponents,
  isolateInsideOfContainer,
  isolateOutsideOfContainer,
  scopedPreflightStyles
});
