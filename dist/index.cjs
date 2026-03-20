"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
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

// node_modules/postcss-js/parser.js
var require_parser = __commonJS({
  "node_modules/postcss-js/parser.js"(exports2, module2) {
    "use strict";
    var postcss2 = require("postcss");
    var IMPORTANT = /\s*!important\s*$/i;
    var UNITLESS = {
      "box-flex": true,
      "box-flex-group": true,
      "column-count": true,
      "flex": true,
      "flex-grow": true,
      "flex-positive": true,
      "flex-shrink": true,
      "flex-negative": true,
      "font-weight": true,
      "line-clamp": true,
      "line-height": true,
      "opacity": true,
      "order": true,
      "orphans": true,
      "tab-size": true,
      "widows": true,
      "z-index": true,
      "zoom": true,
      "fill-opacity": true,
      "stroke-dashoffset": true,
      "stroke-opacity": true,
      "stroke-width": true
    };
    var { fromCharCode } = String;
    function dashify(str) {
      if (str === "cssFloat") return "float";
      let result = "";
      let i = 0;
      let len = str.length;
      let code;
      if (str.startsWith("ms")) result += fromCharCode(45);
      for (; i < len; i++) {
        code = str[i].charCodeAt(0);
        if (code > 64 && code < 91) {
          result += fromCharCode(45) + fromCharCode(code + 32);
          continue;
        }
        result += fromCharCode(code);
      }
      return result;
    }
    function decl(parent, name, value) {
      if (value === false || value === null) return;
      if (!name.startsWith("--")) {
        name = dashify(name);
      }
      if (typeof value === "number") {
        value = value.toString();
        if (value !== "0" && !UNITLESS[name]) value += "px";
      }
      if (IMPORTANT.test(value)) {
        value = value.replace(IMPORTANT, "");
        parent.push(postcss2.decl({ prop: name, value, important: true }));
      } else {
        parent.push(postcss2.decl({ prop: name, value }));
      }
    }
    function atRule(parent, parts, value) {
      let node = postcss2.atRule({ name: parts[1], params: parts[3] || "" });
      if (typeof value === "object") {
        node.nodes = [];
        parse2(value, node);
      }
      parent.push(node);
    }
    function parse2(obj, parent) {
      let name, node, value;
      for (name in obj) {
        value = obj[name];
        if (value == null) {
          continue;
        } else if (name[0] === "@") {
          let parts = name.match(/@(\S+)(\s+([\W\w]*)\s*)?/);
          if (Array.isArray(value)) {
            for (let i of value) {
              atRule(parent, parts, i);
            }
          } else {
            atRule(parent, parts, value);
          }
        } else if (Array.isArray(value)) {
          for (let i of value) {
            decl(parent, name, i);
          }
        } else if (typeof value === "object") {
          node = postcss2.rule({ selector: name });
          parse2(value, node);
          parent.push(node);
        } else {
          decl(parent, name, value);
        }
      }
    }
    module2.exports = function(obj) {
      let root = postcss2.root();
      parse2(obj, root);
      return root;
    };
  }
});

// node_modules/postcss-js/objectifier.js
var require_objectifier = __commonJS({
  "node_modules/postcss-js/objectifier.js"(exports2, module2) {
    "use strict";
    var UNITLESS = {
      boxFlex: true,
      boxFlexGroup: true,
      columnCount: true,
      flex: true,
      flexGrow: true,
      flexPositive: true,
      flexShrink: true,
      flexNegative: true,
      fontWeight: true,
      lineClamp: true,
      lineHeight: true,
      opacity: true,
      order: true,
      orphans: true,
      tabSize: true,
      widows: true,
      zIndex: true,
      zoom: true,
      fillOpacity: true,
      strokeDashoffset: true,
      strokeOpacity: true,
      strokeWidth: true
    };
    function atRule(node) {
      return node.nodes === void 0 ? true : process(node);
    }
    function camelcase(property) {
      property = property.toLowerCase();
      if (property === "float") return "cssFloat";
      let index2 = property.indexOf("-");
      if (index2 === -1) return property;
      if (property.startsWith("-ms-")) {
        property = property.slice(1);
        index2 = property.indexOf("-");
      }
      let cursor = 0;
      let result = "";
      do {
        result += property.slice(cursor, index2) + property[index2 + 1].toUpperCase();
        cursor = index2 + 2;
        index2 = property.indexOf("-", cursor);
      } while (index2 !== -1);
      return result + property.slice(cursor);
    }
    function process(node, options = {}) {
      let name;
      let result = {};
      node.each((child) => {
        if (child.type === "atrule") {
          name = "@" + child.name;
          if (child.params) name += " " + child.params;
          if (result[name] === void 0) {
            result[name] = atRule(child);
          } else if (Array.isArray(result[name])) {
            result[name].push(atRule(child));
          } else {
            result[name] = [result[name], atRule(child)];
          }
        } else if (child.type === "rule") {
          let body = process(child);
          if (result[child.selector]) {
            for (let i in body) {
              let object = result[child.selector];
              if (options.stringifyImportant && typeof object[i] === "string" && object[i].endsWith("!important")) {
                if (typeof body[i] === "string" && body[i].endsWith("!important")) {
                  object[i] = body[i];
                }
              } else {
                object[i] = body[i];
              }
            }
          } else {
            result[child.selector] = body;
          }
        } else if (child.type === "decl") {
          if (child.prop.startsWith("--")) {
            name = child.prop;
          } else if (child.parent && child.parent.selector === ":export") {
            name = child.prop;
          } else {
            name = camelcase(child.prop);
          }
          let value = child.value;
          if (!isNaN(child.value) && UNITLESS[name]) value = parseFloat(child.value);
          if (child.important) value += " !important";
          if (result[name] === void 0) {
            result[name] = value;
          } else if (Array.isArray(result[name])) {
            result[name].push(value);
          } else {
            result[name] = [result[name], value];
          }
        }
      });
      return result;
    }
    module2.exports = process;
  }
});

// node_modules/postcss-js/process-result.js
var require_process_result = __commonJS({
  "node_modules/postcss-js/process-result.js"(exports2, module2) {
    "use strict";
    var objectify2 = require_objectifier();
    module2.exports = function processResult(result) {
      if (console && console.warn) {
        result.warnings().forEach((warn) => {
          console.warn((warn.plugin || "PostCSS") + ": " + warn.text);
        });
      }
      return objectify2(result.root);
    };
  }
});

// node_modules/postcss-js/async.js
var require_async = __commonJS({
  "node_modules/postcss-js/async.js"(exports2, module2) {
    "use strict";
    var postcss2 = require("postcss");
    var parser = require_parser();
    var processResult = require_process_result();
    module2.exports = function async2(plugins) {
      let processor = postcss2(plugins);
      return async (input) => {
        let result = await processor.process(input, { parser, from: void 0 });
        return processResult(result);
      };
    };
  }
});

// node_modules/postcss-js/sync.js
var require_sync = __commonJS({
  "node_modules/postcss-js/sync.js"(exports2, module2) {
    "use strict";
    var postcss2 = require("postcss");
    var parser = require_parser();
    var processResult = require_process_result();
    module2.exports = function(plugins) {
      let processor = postcss2(plugins);
      return (input) => {
        let result = processor.process(input, { parser, from: void 0 });
        return processResult(result);
      };
    };
  }
});

// node_modules/postcss-js/index.js
var require_postcss_js = __commonJS({
  "node_modules/postcss-js/index.js"(exports2, module2) {
    "use strict";
    var async2 = require_async();
    var objectify2 = require_objectifier();
    var parse2 = require_parser();
    var sync2 = require_sync();
    module2.exports = {
      objectify: objectify2,
      parse: parse2,
      async: async2,
      sync: sync2
    };
  }
});

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default,
  scopedPreflightStyles: () => scopedPreflightStyles
});
module.exports = __toCommonJS(index_exports);
var import_node_fs = require("fs");
var import_node_module = require("module");
var import_postcss = __toESM(require("postcss"), 1);

// node_modules/postcss-js/index.mjs
var import_index = __toESM(require_postcss_js(), 1);
var postcss_js_default = import_index.default;
var objectify = import_index.default.objectify;
var parse = import_index.default.parse;
var async = import_index.default.async;
var sync = import_index.default.sync;

// src/index.ts
var import_plugin = __toESM(require("tailwindcss/plugin"), 1);

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
function isolateInsideOfContainer(containerSelectors, options) {
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
}
function isolateOutsideOfContainer(containerSelectors, options) {
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
}

// src/index.ts
var import_meta = {};
var USAGE_EXAMPLE = `  @plugin "tailwindcss-scoped-preflight" {
    isolationStrategy: inside;
    selector: .twp;
  }`;
function parseCommaList(value) {
  return value ? value.split(",").map((s) => s.trim()) : void 0;
}
function escapeSelectorColon(selector) {
  return selector.replace(/(?<!\\):/g, "\\:");
}
function parseSelectors(raw) {
  const list = Array.isArray(raw) ? raw.map((s) => s.trim()).filter(Boolean) : typeof raw === "string" ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [];
  if (list.length === 0) {
    throw new Error(
      `tailwindcss-scoped-preflight: selector is required.
Example:
${USAGE_EXAMPLE}`
    );
  }
  return list.map(escapeSelectorColon);
}
function resolveStrategy(options) {
  const selectors = parseSelectors(options.selector);
  const ignore = parseCommaList(options.ignore);
  const remove = parseCommaList(options.remove);
  if (options.isolationStrategy === "inside") {
    return isolateInsideOfContainer(selectors, {
      ignore,
      remove,
      except: options.except,
      rootStyles: options.rootStyles
    });
  }
  if (options.isolationStrategy === "outside") {
    return isolateOutsideOfContainer(selectors, {
      ignore,
      remove,
      plus: options.plus
    });
  }
  throw new Error(
    `tailwindcss-scoped-preflight: isolationStrategy must be "inside" or "outside".
Got: "${options.isolationStrategy}". Example:
${USAGE_EXAMPLE}`
  );
}
var scopedPreflightStyles = import_plugin.default.withOptions(
  (options) => ({ addBase }) => {
    if (!options) {
      throw new Error(
        `tailwindcss-scoped-preflight: plugin options are required.
Example:
${USAGE_EXAMPLE}`
      );
    }
    const strategy = resolveStrategy(options);
    const req = typeof require !== "undefined" ? require : (0, import_node_module.createRequire)(import_meta.url);
    const baseCssPath = req.resolve("tailwindcss/preflight.css");
    const baseCssStyles = import_postcss.default.parse((0, import_node_fs.readFileSync)(baseCssPath, "utf8"));
    baseCssStyles.walkRules((rule) => {
      rule.selectors = rule.selectors.map((s) => strategy({ ruleSelector: s })).filter((value, index2, array) => value && array.indexOf(value) === index2);
      rule.selector = rule.selectors.join(",\n");
      if (!rule.nodes.some((n) => n instanceof import_postcss.default.Declaration)) {
        rule.nodes = [];
      }
    });
    const cleanedRoot = import_postcss.default.root();
    baseCssStyles.nodes.forEach((node, i, all) => {
      const next = all[i + 1];
      if (node instanceof import_postcss.default.Rule) {
        if (node.nodes.length > 0 && node.selector) {
          cleanedRoot.append(node.clone());
        }
      } else if (node instanceof import_postcss.default.Comment) {
        if (next instanceof import_postcss.default.Rule && next.selector && next.nodes.length > 0) {
          cleanedRoot.append(node.clone());
        }
      } else {
        cleanedRoot.append(node.clone());
      }
    });
    const cssInJs = postcss_js_default.objectify(cleanedRoot);
    addBase(cssInJs);
  }
);
var index_default = scopedPreflightStyles;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  scopedPreflightStyles
});
