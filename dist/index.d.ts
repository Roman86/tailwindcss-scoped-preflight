import * as tailwindcss_types_config_js from 'tailwindcss/types/config.js';

interface Options {
    ignore?: string[];
    remove?: string[];
}
type SelectorBasedStrategy<ExtraOptions = unknown> = (selectors: string | string[], options?: Options & ExtraOptions) => CSSRuleSelectorTransformer;
/**
 * Isolates the TailwindCSS preflight styles inside of the container (assuming all the TailwindCSS is inside of this container)
 *
 * @param containerSelectors
 * @param options
 * @param options.ignore - list of preflight CSS selectors to ignore (don't isolate) - these will not be affected by the transformation
 * @param options.remove - list of preflight CSS selectors to remove from the final CSS - use it if you have any specific conflicts and really want to remove some preflight rules
 * @param options.rootStyles - 'move to container' (default) - moves the root styles to the container styles (by simply replacing the selector), 'add :where' - adds ` :where` to the root selector so styles are still in roots, but only matching items would be affected
 *
 * @link https://www.npmjs.com/package/tailwindcss-scoped-preflight#isolate-inside-of-container (example)
 */
declare const isolateInsideOfContainer: SelectorBasedStrategy<{
    except?: string;
    rootStyles?: 'move to container' | 'add :where';
}>;
/**
 * Isolates the TailwindCSS preflight styles outside of the container (assuming no TailwindCSS inside of it)
 * @param containerSelectors
 * @param options
 * @param options.ignore - list of preflight CSS selectors to ignore (don't isolate) - these will not be affected by the transformation
 * @param options.remove - list of preflight CSS selectors to remove from the final CSS - use it if you have any specific conflicts and really want to remove some preflight rules
 *
 * @link https://www.npmjs.com/package/tailwindcss-scoped-preflight#isolate-outside-of-container (example)
 */
declare const isolateOutsideOfContainer: SelectorBasedStrategy<{
    plus?: string;
}>;
/**
 * @deprecated Use `isolateInsideOfContainer` with rootStyles option set to 'add :where'
 * @description Isolates the TailwindCSS preflight styles within the component selector (not inside of the container, but immediately)
 * @param componentSelectors
 * @param options
 * @param options.ignore - list of preflight CSS selectors to ignore (don't isolate) - these will not be affected by the transformation
 * @param options.remove - list of preflight CSS selectors to remove from the final CSS - use it if you have any specific conflicts and really want to remove some preflight rules
 *
 * @link https://www.npmjs.com/package/tailwindcss-scoped-preflight#update-your-tailwind-css-configuration (example)
 */
declare const isolateForComponents: SelectorBasedStrategy;

interface PropsFilterInput {
    selectorSet: Set<string>;
    property: string;
    value: any;
}
type CSSRuleSelectorTransformer = (info: {
    ruleSelector: string;
}) => string;
type ModifyResult = string | null | undefined;
type ModifyStylesHook = (input: PropsFilterInput) => ModifyResult;
interface PluginOptions {
    isolationStrategy: CSSRuleSelectorTransformer;
    /** @deprecated prefer using modifyPreflightStyles */
    propsFilter?: (input: PropsFilterInput) => boolean | undefined;
    modifyPreflightStyles?: Record<string, Record<string, ModifyResult>> | ModifyStylesHook;
}
/**
 * TailwindCSS plugin to scope the preflight styles
 * @param isolationStrategy - function to transform the preflight CSS selectors,
 *  import {@link https://www.npmjs.com/package/tailwindcss-scoped-preflight#isolate-inside-of-container isolateInsideOfContainer},
 *  {@link https://www.npmjs.com/package/tailwindcss-scoped-preflight#isolate-outside-of-container isolateOutsideOfContainer},
 *  {@link https://www.npmjs.com/package/tailwindcss-scoped-preflight#update-your-tailwind-css-configuration isolateForComponents} or write {@link https://www.npmjs.com/package/tailwindcss-scoped-preflight#your-owncustom-isolation-strategy your own}
 * @param propsFilter - function to filter the preflight CSS properties and values, return false to remove the property. Any other value (including true and undefined) will leave the prop intact
 * @param modifyPreflightStyles - function to modify the preflight CSS properties and their values, return null to remove the property. Any other returned value will be used as a new value for the property. If you don't want to change it - return the old value (provided in argument object as `value`).
 * @link https://www.npmjs.com/package/tailwindcss-scoped-preflight (documentation)
 */
declare const scopedPreflightStyles: {
    (options: PluginOptions): {
        handler: tailwindcss_types_config_js.PluginCreator;
        config?: Partial<tailwindcss_types_config_js.Config>;
    };
    __isOptionsFunction: true;
};

export { type CSSRuleSelectorTransformer, isolateForComponents, isolateInsideOfContainer, isolateOutsideOfContainer, scopedPreflightStyles };
