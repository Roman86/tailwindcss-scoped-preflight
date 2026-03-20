import { N, P } from './resolve-config-QUZ9b-Gn.mjs';

/**
 * The source code for one or more nodes in the AST
 *
 * This generally corresponds to a stylesheet
 */
interface Source {
    /**
     * The path to the file that contains the referenced source code
     *
     * If this references the *output* source code, this is `null`.
     */
    file: string | null;
    /**
     * The referenced source code
     */
    code: string;
}
/**
 * The file and offsets within it that this node covers
 *
 * This can represent either:
 * - A location in the original CSS which caused this node to be created
 * - A location in the output CSS where this node resides
 */
type SourceLocation = [source: Source, start: number, end: number];
type PluginFn = (api: PluginAPI) => void;
type PluginWithConfig = {
    handler: PluginFn;
    config?: UserConfig;
    /** @internal */
    reference?: boolean;
    src?: SourceLocation | undefined;
};
type PluginWithOptions<T> = {
    (options?: T): PluginWithConfig;
    __isOptionsFunction: true;
};
type Plugin = PluginFn | PluginWithConfig | PluginWithOptions<any>;
type PluginAPI = {
    addBase(base: CssInJs): void;
    addVariant(name: string, variant: string | string[] | CssInJs): void;
    matchVariant<T = string>(name: string, cb: (value: T | string, extra: {
        modifier: string | null;
    }) => string | string[], options?: {
        values?: Record<string, T>;
        sort?(a: {
            value: T | string;
            modifier: string | null;
        }, b: {
            value: T | string;
            modifier: string | null;
        }): number;
    }): void;
    addUtilities(utilities: Record<string, CssInJs | CssInJs[]> | Record<string, CssInJs | CssInJs[]>[], options?: {}): void;
    matchUtilities(utilities: Record<string, (value: string, extra: {
        modifier: string | null;
    }) => CssInJs | CssInJs[]>, options?: Partial<{
        type: string | string[];
        supportsNegativeValues: boolean;
        values: Record<string, string> & {
            __BARE_VALUE__?: (value: N) => string | undefined;
        };
        modifiers: 'any' | Record<string, string>;
    }>): void;
    addComponents(utilities: Record<string, CssInJs> | Record<string, CssInJs>[], options?: {}): void;
    matchComponents(utilities: Record<string, (value: string, extra: {
        modifier: string | null;
    }) => CssInJs>, options?: Partial<{
        type: string | string[];
        supportsNegativeValues: boolean;
        values: Record<string, string> & {
            __BARE_VALUE__?: (value: N) => string | undefined;
        };
        modifiers: 'any' | Record<string, string>;
    }>): void;
    theme(path: string, defaultValue?: any): any;
    config(path?: string, defaultValue?: any): any;
    prefix(className: string): string;
};
type CssInJs = {
    [key: string]: string | string[] | CssInJs | CssInJs[];
};

type ResolvableTo<T> = T | ((utils: P) => T);
type ThemeValue = ResolvableTo<Record<string, unknown>> | null | undefined;
type ThemeConfig = Record<string, ThemeValue> & {
    extend?: Record<string, ThemeValue>;
};
type ContentFile = string | {
    raw: string;
    extension?: string;
};
type DarkModeStrategy = false | 'media' | 'class' | ['class', string] | 'selector' | ['selector', string] | ['variant', string | string[]];
interface UserConfig {
    presets?: UserConfig[];
    theme?: ThemeConfig;
    plugins?: Plugin[];
}
interface UserConfig {
    content?: ContentFile[] | {
        relative?: boolean;
        files: ContentFile[];
    };
}
interface UserConfig {
    darkMode?: DarkModeStrategy;
}
interface UserConfig {
    prefix?: string;
}
interface UserConfig {
    blocklist?: string[];
}
interface UserConfig {
    important?: boolean | string;
}
interface UserConfig {
    future?: 'all' | Record<string, boolean>;
}
interface UserConfig {
    experimental?: 'all' | Record<string, boolean>;
}

interface StrategyBaseOptions {
    ignore?: string[];
    remove?: string[];
}
interface InsideStrategyOptions extends StrategyBaseOptions {
    except?: string;
    rootStyles?: 'move to container' | 'add :where';
}
interface OutsideStrategyOptions extends StrategyBaseOptions {
    plus?: string;
}

interface CSSPluginBase {
    selector: string | string[];
    ignore?: string;
    remove?: string;
}
type ExclusiveKeys<T> = keyof Omit<T, keyof StrategyBaseOptions>;
type InsidePluginOptions = CSSPluginBase & Pick<InsideStrategyOptions, ExclusiveKeys<InsideStrategyOptions>> & {
    [K in ExclusiveKeys<OutsideStrategyOptions>]?: never;
} & {
    isolationStrategy: 'inside';
};
type OutsidePluginOptions = CSSPluginBase & Pick<OutsideStrategyOptions, ExclusiveKeys<OutsideStrategyOptions>> & {
    [K in ExclusiveKeys<InsideStrategyOptions>]?: never;
} & {
    isolationStrategy: 'outside';
};
type V4PluginOptions = InsidePluginOptions | OutsidePluginOptions;
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
declare const scopedPreflightStyles: PluginWithOptions<V4PluginOptions>;

export { scopedPreflightStyles as default, scopedPreflightStyles };
