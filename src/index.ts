import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import postcss from 'postcss';
import postcssJs from 'postcss-js';
import plugin from 'tailwindcss/plugin';
import type { KebabCasedPropertiesDeep, Schema } from 'type-fest';
import {
  type CSSRuleSelectorTransformer,
  type InsideStrategyOptions,
  isolateInsideOfContainer,
  isolateOutsideOfContainer,
  type OutsideStrategyOptions,
  type StrategyBaseOptions,
} from './strategies.js';

// CSS @plugin blocks pass ignore/remove as comma-separated strings, not arrays
type CSSPluginBase = {
  selector: string | string[];
} & Schema<StrategyBaseOptions, string>;

type OptionalNever<O> = {
  [K in keyof O]?: never;
};

type PluginStrategyOptions<
  strategyId extends string,
  TargetStrategyOptions extends StrategyBaseOptions,
  OtherStrategyOptionsToAddAsOptionalNever extends StrategyBaseOptions,
> = OptionalNever<OtherStrategyOptionsToAddAsOptionalNever> &
  CSSPluginBase &
  Omit<TargetStrategyOptions, keyof CSSPluginBase> & { isolationStrategy: strategyId };

type PluginInsideStrategyOptions = PluginStrategyOptions<
  'inside',
  InsideStrategyOptions,
  OutsideStrategyOptions
>;
type PluginOutsideStrategyOptions = PluginStrategyOptions<
  'outside',
  OutsideStrategyOptions,
  InsideStrategyOptions
>;

type V4PluginOptions = PluginInsideStrategyOptions | PluginOutsideStrategyOptions;

type V4PluginOptionsKebabized = KebabCasedPropertiesDeep<V4PluginOptions>;

const USAGE_EXAMPLE = `  @plugin "tailwindcss-scoped-preflight" {\n    isolation-strategy: inside;\n    selector: .twp;\n  }`;

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
    : raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

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
    `tailwindcss-scoped-preflight: isolation strategy must be either "inside" or "outside".\n` +
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
 *   isolation-strategy: inside;
 *   selector: .twp;
 * }
 * ```
 *
 * @link https://www.npmjs.com/package/tailwindcss-scoped-preflight (documentation)
 */
export const scopedPreflightStyles = plugin.withOptions<V4PluginOptions | V4PluginOptionsKebabized>(
  (options) =>
    ({ addBase }) => {
      if (!options) {
        throw new Error(
          `tailwindcss-scoped-preflight: plugin options are required.\nExample:\n${USAGE_EXAMPLE}`,
        );
      }
      const optionsFamiliar = familiarizeOptions(options);
      const strategy = resolveStrategy(optionsFamiliar);

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

function familiarizeOptions(options: V4PluginOptions | V4PluginOptionsKebabized): V4PluginOptions {
  const isKebabOptions = (
    options: V4PluginOptions | V4PluginOptionsKebabized,
  ): options is V4PluginOptionsKebabized => 'isolation-strategy' in options;

  if (!isKebabOptions(options)) {
    return options;
  }

  if (options['isolation-strategy'] === 'outside') {
    return { ...options, isolationStrategy: options['isolation-strategy'] };
  }
  return {
    ...options,
    isolationStrategy: options['isolation-strategy'],
    rootStyles: options['root-styles'],
  };
}

// Default export for @plugin directive in TailwindCSS v4
export default scopedPreflightStyles;
