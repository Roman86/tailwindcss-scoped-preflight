interface PluginOptions {
    preflightSelector: string;
    enable?: boolean;
    disableCorePreflight?: boolean;
}
export declare const scopedPreflightStyles: {
    (options: PluginOptions): {
        handler: import("tailwindcss/types/config").PluginCreator;
        config?: Partial<import("tailwindcss/types/config").Config> | undefined;
    };
    __isOptionsFunction: true;
};
export {};
