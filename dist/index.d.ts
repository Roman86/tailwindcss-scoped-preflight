interface PluginOptions {
    cssSelector: string;
    mode?: 'matched only' | 'under matched' | 'except matched';
}
export declare const scopedPreflightStyles: {
    (options: PluginOptions): {
        handler: import("tailwindcss/types/config").PluginCreator;
        config?: Partial<import("tailwindcss/types/config").Config> | undefined;
    };
    __isOptionsFunction: true;
};
export {};
