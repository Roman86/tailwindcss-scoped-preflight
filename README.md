### What

[Tailwind CSS](https://tailwindcss.com/) plugin

### Why

To avoid style conflicts (CSS collisions/interference side effects) when using Tailwind CSS with other UI libraries like Antd, Vuetify etc.

### How

This plugin is limiting the scope of [Tailwind's opinionated preflight styles](https://tailwindcss.com/docs/preflight) to the customizable CSS selector.
So you can control where exactly in DOM to apply these base styles - usually it's your own components (not the 3rd party).

## Version 3 is here 🎉

[Migrate from v2](#from-v2) | [Migrate from v1](#from-v1)

Looking for old version's documentation? [v2](https://www.npmjs.com/package/tailwindcss-scoped-preflight/v/legacy-2) | [v1](https://www.npmjs.com/package/tailwindcss-scoped-preflight/v/legacy-1)

Starting from version 3 it provides a powerful configuration to (optionally):

- 🤌 precisely control CSS selectors;
- 💨 flexibly remove some CSS rules, if you need;
- 🔎 or even remove (or change) particular CSS properties (if you have some specific conflicts).

For ease of use, there are 3 pre-bundled isolation strategies available (as named imports) that cover 99% cases:

- `isolateInsideOfContainer` - everything is protected from the preflight styles, except specified Tailwind root(s).
  Use it when you have all the tailwind-powered stuff **isolated under some root container**.
- `isolateOutsideOfContainer` - protects specific root(s) from the preflight styles - Tailwind is everywhere outside.
  Use it when you have Tailwind powered stuff everywhere as usual, but you want to **exclude some part of the DOM** from being affected by the preflight styles.
- `isolateForComponents` - everything is protected from the preflight styles, except components marked with the selector of your choice.
  Use it when you want the preflight styles to be applied only to particular elements **immediately** (without extra roots or wrappers).
  Good for components - just specify some unique css class for all your components and use them anywhere.

> Although all the strategies allow you to specify a number of selectors - it's recommended to use one short selector to avoid CSS bloat as selectors repeat many times in the generated CSS.

🔨 If none of these strategies work for your case, or something isn't perfect - you can [create your own strategy](#your-owncustom-isolation-strategy).

## 1. Install

```bash
npm i tailwindcss-scoped-preflight
```

## 2. Inject the plugin with the strategy of choice

#### Update your Tailwind CSS configuration

Following example is pretty comprehensive and shows all the available options, but you can use just the `isolationStrategy` option with a single selector if you don't need to fine tune the transformation.
You can find minimalistic examples for other strategies [below](#isolate-inside-of-container).

```javascript
// # tailwind.config.js

import {
  scopedPreflightStyles,
  isolateForComponents, // there are also isolateInsideOfContainer and isolateOutsideOfContainer
} from 'tailwindcss-scoped-preflight';

/** @type {import("tailwindcss").Config} */
const config = {
  // ... your Tailwind CSS config
  plugins: [
    // ... other plugins
    scopedPreflightStyles({
      isolationStrategy: isolateForComponents(
        // selector string or array of selectors - the less/shorter - the better
        [
          '.twp',
          '.comp',
        ],
        // every strategy provides the same options (optional) to fine tune the transformation
        {
          // ignore: ["html", ":host", "*"], // when used, these will not be affected by the transformation
          // remove: [":before", ":after"], // this can remove mentioned rules completely
        },
      ),

      // or make your own rules transformation
      // isolationStrategy: ({ ruleSelector }) =>
      //   ruleSelector === '*'
      //     ? '' // returning empty string removes the rule
      //     : [
      //       'html',
      //       ':host',
      //       'body',
      //     ].includes(ruleSelector)
      //       ? `${ruleSelector} .twp` // some custom transformation for html, :host and body
      //       : isolateForComponents('.twp')(ruleSelector), // otherwise, transform it as per components strategy (just for example)

      // it's also possible to filter out some properties:
      // return false to remove the property,
      // any other value (including true and undefined) will leave the prop intact
      // (propsFilter is DEPRECATED - prefer using modifyPreflightStyles instead of propFilter)
      propsFilter: ({ selectorSet, property, value }) =>
        // return false to remove the property. Any other value (including true and undefined) will leave the prop intact
        ![
          // removes the margin reset from a body rule
          selectorSet.has('body') && ['margin'].includes(property),
          // removes the box-sizing: border-box whenever it's found
          property === 'box-sizing' && value === 'border-box',
          // removes the font-family (except inherit) from all the rules
          property === 'font-family' && value !== 'inherit',
        ].some(Boolean),
      // preferred way to modify the preflight styles
      modifyPreflightStyles: ({ selectorSet, property, value }) => {
        // let's say you want to override the font family
        if (property === 'font-family' && value !== 'inherit') {
          return '"Open Sans", sans-serif';
        }
        // or body margin
        if (selectorSet.has('body') && property === 'margin') {
          return '0 4px';
        }
        // if you want to remove some property - return null
        if (selectorSet.has('html') && property === 'line-height') {
          return null;
        }
        // to keep the property as it is - you may return the original value;
        // but returning undefined would have the same effect,
        // so you may just omit such default return
        return value;
      },
    }),
  ],
};

exports.default = config;
```

## 3. Use your selector according to the strategy

```tsx
// # MyTailwindButton.tsx

import { type PropsWithChildren } from 'react';

export function MyTailwindButton({ children }: PropsWithChildren): ReactElement {
  return (
    <button className={'comp'}>
      {/* this button won't have a default border and background
      because of Tailwind CSS preflight styles applied to the elements
      with the .comp class (as per the configuration).
      Other buttons will have their original/default styles */}
      {children}
    </button>
  );
}
```

## Other strategies examples

### Isolate Inside of Container

```javascript
// # tailwind.config.js

import { scopedPreflightStyles, isolateInsideOfContainer } from 'tailwindcss-scoped-preflight';

/** @type {import("tailwindcss").Config} */
const config = {
  // ... your Tailwind CSS config
  plugins: [
    // ... other plugins
    scopedPreflightStyles({
      // pretty minimalistic example. Same options as in the previous example are available
      isolationStrategy: isolateInsideOfContainer('#tw-app'),
    }),
  ],
};

exports.default = config;
```

### Isolate Outside of Container

```javascript
// # tailwind.config.js

import { scopedPreflightStyles, isolateOutsideOfContainer } from 'tailwindcss-scoped-preflight';

/** @type {import("tailwindcss").Config} */
const config = {
  // ... your Tailwind CSS config
  plugins: [
    // ... other plugins
    scopedPreflightStyles({
      // pretty minimalistic example. Same options as in the previous example are available
      isolationStrategy: isolateOutsideOfContainer('#antd-root'),
    }),
  ],
};

exports.default = config;
```

### Your own/custom isolation strategy

```javascript
// # tailwind.config.js

import { scopedPreflightStyles } from 'tailwindcss-scoped-preflight';

/** @type {import("tailwindcss").Config} */
const config = {
  // ... your Tailwind CSS config
  plugins: [
    // ... other plugins
    scopedPreflightStyles({
      // it's basically a function accepting original selector and returning a transformed one
      isolationStrategy: ({ ruleSelector }) =>
        ruleSelector === '*'
          ? '' // returning empty string removes the rule
          : [
                'html',
                ':host',
                'body',
              ].includes(ruleSelector)
            ? `${ruleSelector} .twp` // some custom transformation for html, :host and body
            : isolateForComponents('.twp')(ruleSelector), // otherwise, transform it as per components strategy (just for example)

      // just for demo purpose
      modifyPreflightStyles: ({ selectorSet, property, value }) => {
        // let's say you want to override the font family
        if (property === 'font-family' && value !== 'inherit') {
          return '"Open Sans", sans-serif';
        }
      },
    }),
  ],
};

exports.default = config;
```

> Once again - keep custom selectors short, and prefer using just one selector (should be enough) - it will result in smaller CSS

# Migration guide (to v3)

## from v2

#### for 'matched only' mode users

```diff
import {
  scopedPreflightStyles,
+ isolateInsideOfContainer,
} from 'tailwindcss-scoped-preflight';

// ...
     scopedPreflightStyles({
-       mode: 'matched only',
-       cssSelector: '.twp',
+       isolationStrategy: isolateInsideOfContainer('.twp'),
      }),
```

Is some cases you may have to pick the isolateForComponents strategy - try which works best for you.

#### for 'except matched' mode users

```diff
import {
  scopedPreflightStyles,
+ isolateOutsideOfContainer,
} from 'tailwindcss-scoped-preflight';

// ...
     scopedPreflightStyles({
-       mode: 'except matched',
-       cssSelector: '.notwp',
+       isolationStrategy: isolateOutsideOfContainer('.notwp'),
      }),
```

## from v1

```diff
import {
  scopedPreflightStyles,
+ isolateInsideOfContainer,
} from 'tailwindcss-scoped-preflight';

// ...
     scopedPreflightStyles({
-       preflightSelector: '.twp',
-       disableCorePreflight: true,
+       isolationStrategy: isolateInsideOfContainer('.twp'),
      }),
```
