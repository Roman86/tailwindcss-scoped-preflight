import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import postcss from 'postcss';
import postcssJs from 'postcss-js';
import plugin from 'tailwindcss/plugin';
import {
  type CSSRuleSelectorTransformer,
  type InsideStrategyOptions,
  type OutsideStrategyOptions,
  type StrategyBaseOptions,
  isolateInsideOfContainer,
  isolateOutsideOfContainer,
} from './strategies.js';

// CSS @plugin blocks pass ignore/remove as comma-separated strings, not arrays
interface CSSPluginBase {
  selector: string | string[];
  ignore?: string;
  remove?: string;
}

// Extracts strategy-specific keys (excluding base ignore/remove) and marks the other strategy's keys as never
type ExclusiveKeys<T> = keyof Omit<T, keyof StrategyBaseOptions>;

type InsidePluginOptions = CSSPluginBase &
  Pick<InsideStrategyOptions, ExclusiveKeys<InsideStrategyOptions>> &
  { [K in ExclusiveKeys<OutsideStrategyOptions>]?: never } &
  { isolationStrategy: 'inside' };

type OutsidePluginOptions = CSSPluginBase &
  Pick<OutsideStrategyOptions, ExclusiveKeys<OutsideStrategyOptions>> &
  { [K in ExclusiveKeys<InsideStrategyOptions>]?: never } &
  { isolationStrategy: 'outside' };

type V4PluginOptions = InsidePluginOptions | OutsidePluginOptions;

const USAGE_EXAMPLE = `  @plugin "tailwindcss-scoped-preflight" {\n    isolationStrategy: inside;\n    selector: .twp;\n  }`;

function parseCommaList(value?: string): string[] | undefined {
  return value ? value.split(',').map((s) => s.trim()) : undefined;
}

// Escape colons in container selectors so Tailwind modifier separators
// (e.g. .xl:px-foo) become valid CSS (e.g. .xl\:px-foo).
// Container selectors are simple class/ID selectors — no pseudo-classes expected.
function escapeSelectorColon(selector: string): string {
  return selector.replace(/(?<!\\):/g, '\\:');
}

function parseSelectors(raw: string | string[]): string[] {
  const list = Array.isArray(raw)
    ? raw.map((s) => s.trim()).filter(Boolean)
    : typeof raw === 'string'
      ? raw.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

  if (list.length === 0) {
    throw new Error(
      `tailwindcss-scoped-preflight: selector is required.\nExample:\n${USAGE_EXAMPLE}`,
    );
  }

  return list.map(escapeSelectorColon);
}

function resolveStrategy(options: V4PluginOptions): CSSRuleSelectorTransformer {
  const selectors = parseSelectors(options.selector);
  const ignore = parseCommaList(options.ignore);
  const remove = parseCommaList(options.remove);

  if (options.isolationStrategy === 'inside') {
    return isolateInsideOfContainer(selectors, {
      ignore,
      remove,
      except: options.except,
      rootStyles: options.rootStyles,
    });
  }

  if (options.isolationStrategy === 'outside') {
    return isolateOutsideOfContainer(selectors, {
      ignore,
      remove,
      plus: options.plus,
    });
  }

  throw new Error(
    `tailwindcss-scoped-preflight: isolationStrategy must be "inside" or "outside".\n` +
      `Got: "${(options as { isolationStrategy: string }).isolationStrategy}". Example:\n${USAGE_EXAMPLE}`,
  );
}

/**
 * TailwindCSS v4 plugin to scope the preflight styles to a specific container.
 *
 * Use via the @plugin CSS directive:
 * @example
 * ```css
 * @plugin "tailwindcss-scoped-preflight" {
 *   isolationStrategy: inside;
 *   selector: .twp;
 * }
 * ```
 *
 * @link https://www.npmjs.com/package/tailwindcss-scoped-preflight (documentation)
 */
export const scopedPreflightStyles = plugin.withOptions<V4PluginOptions>(
  (options) =>
    ({ addBase }) => {
      if (!options) {
        throw new Error(
          `tailwindcss-scoped-preflight: plugin options are required.\nExample:\n${USAGE_EXAMPLE}`,
        );
      }
      const strategy = resolveStrategy(options);

      const req = typeof require !== 'undefined' ? require : createRequire(import.meta.url);
      const baseCssPath = req.resolve('tailwindcss/preflight.css');
      const baseCssStyles = postcss.parse(readFileSync(baseCssPath, 'utf8'));

      baseCssStyles.walkRules((rule) => {
        rule.selectors = rule.selectors
          .map((s) => strategy({ ruleSelector: s }))
          .filter((value, index, array) => value && array.indexOf(value) === index);
        rule.selector = rule.selectors.join(',\n');
        if (!rule.nodes.some((n) => n instanceof postcss.Declaration)) {
          rule.nodes = [];
        }
      });

      // Remove empty rules and orphaned comments
      const cleanedRoot = postcss.root();
      baseCssStyles.nodes.forEach((node, i, all) => {
        const next = all[i + 1];
        if (node instanceof postcss.Rule) {
          if (node.nodes.length > 0 && node.selector) {
            cleanedRoot.append(node.clone());
          }
        } else if (node instanceof postcss.Comment) {
          if (next instanceof postcss.Rule && next.selector && next.nodes.length > 0) {
            cleanedRoot.append(node.clone());
          }
        } else {
          cleanedRoot.append(node.clone());
        }
      });

      // Convert PostCSS AST to CssInJs for v4 addBase
      const cssInJs = postcssJs.objectify(cleanedRoot);
      addBase(cssInJs);
    },
);

// Default export for @plugin directive in TailwindCSS v4
export default scopedPreflightStyles;
