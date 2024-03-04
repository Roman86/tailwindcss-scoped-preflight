export const booleanFilter = Boolean as any as <T>(
    x: T | false | null | undefined,
) => x is T;
