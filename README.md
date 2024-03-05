### What

Tailwind CSS plugin

### Why

To avoid style conflicts (CSS collisions/interference side effects) when using Tailwind CSS with other UI libraries like Antd, Vuetify etc.

### How

This plugin is limiting the scope of [Tailwind's opinionated preflight styles](https://tailwindcss.com/docs/preflight) to the customizable CSS ruleSelector.
So you can control where exactly in DOM to apply these base styles - usually it's your own components (not the 3rd party).

Starting from version 3 it provides a powerful configuration to (optionally):

- 🤌 precisely control CSS selectors;
- 💨 flexibly remove some CSS rules, if you need;
- 🔎 or even remove particular CSS properties (if you have some specific conflicts).

For ease of use, there are 3 pre-bundled isolation strategies available (as named imports) that cover 99% cases:

- `isolateInsideOfContainer` - everything is protected from preflight, except specified Tailwind root(s).
  Use it when you have all the tailwind-powered stuff **isolated under some root container**.
- `isolateOutsideOfContainer` - protects specific root(s) from preflight - Tailwind is everywhere outside.
  Use it when you have tailwind everywhere as usual, but you want to **exclude some part of the DOM** from preflight styles.
- `isolateForComponents` - everything is protected from preflight, except components marked with specified selector.
  Use it when you want preflight styles to be applied **only to particular elements** immediately (without extra roots or wrappers).
  Good for components - just specify some unique css class for all your components and use them anywhere.

> Although all the strategies allow you to specify a number of selectors - it's recommended to use one short ruleSelector to avoid CSS bloat as selectors repeat many times in the generated CSS.

🔨 If none of these strategies work for your case, or something isn't perfect - you can create your own strategy (examples below).

## 1. Install

```bash
npm i tailwindcss-scoped-preflight
```

## 2. Inject the plugin with the strategy of choice

#### Update your Tailwind CSS configuration

Following example is pretty comprehensive and shows all the available options, but you can use just the `isolationStrategy` with a single selector if you don't need to fine tune the transformation.
You can find minimalistic examples for other strategies below.

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
        // ruleSelector string or array of selectors - the less/shorter - the better
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

      // or you can make your own rules isolation strategy - it's basically a function accepting original ruleSelector and returning a transformed one
      // isolationStrategy: (ruleSelector) =>
      //   ruleSelector === '*'
      //     ? '' // returning empty string removes the rule
      //     : ['html', ':host'].includes(ruleSelector)
      //       ? ruleSelector // this way we can keeps the original ruleSelector
      //       : isolateForComponents(".twp")(ruleSelector), // otherwise, transforms it as per strategy (just for the fallback example)

      // it's also possible to filter out some properties
      propsFilter: ({ selectorSet, property, value }) =>
        ![
          // removes the margin reset from a body rule
          selectorSet.has('body') && ['margin'].includes(property),
          // removes the box-sizing: border-box whenever it's found
          property === 'box-sizing' && value === 'border-box',
          // removes the font-family (except inherit) from all the rules
          property === 'font-family' && value !== 'inherit',
        ].some(Boolean), // yep, "some" approach is a bit slower because it will evaluate all array conditions anyway, but it's more readable without || operators
    }),
  ],
};

exports.default = config;
```

## 3. Use your ruleSelector according to the strategy

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

Above example is for the `isolateForComponents` strategy, but you can use `isolateInsideOfContainer` and `isolateOutsideOfContainer` as well.

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
      // it's basically a function accepting original ruleSelector and returning a transformed one
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

      // just for demo purpose - let's also filter out some properties
      propsFilter: ({ selectorSet, property, value }) =>
        ![
          // removes the margin reset from a body rule
          selectorSet.has('body') && ['margin'].includes(property),
          // removes the box-sizing: border-box whenever it's found
          property === 'box-sizing' && value === 'border-box',
          // removes the font-family (except inherit) from all the rules
          property === 'font-family' && value !== 'inherit',
        ].some(Boolean), // yep, "some" approach is a bit slower because it will evaluate all array conditions anyway, but it's more readable without || operators
    }),
  ],
};

exports.default = config;
```

> Once again - keep custom selectors short, and prefer using just one ruleSelector (should be enough) - it will result in smaller CSS

# Migration guide (to v3)

## from v2

#### for 'matched only' mode users

```diff
- import { scopedPreflightStyles } from 'tailwindcss-scoped-preflight';
+ import { scopedPreflightStyles, isolateInsideOfContainer } from 'tailwindcss-scoped-preflight';

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
- import { scopedPreflightStyles } from 'tailwindcss-scoped-preflight';
+ import { scopedPreflightStyles, isolateOutsideOfContainer } from 'tailwindcss-scoped-preflight';

// ...
     scopedPreflightStyles({
-       mode: 'except matched',
-       cssSelector: '.notwp',
+       isolationStrategy: isolateOutsideOfContainer('.notwp'),
      }),
```

## from v1

```diff
- import { scopedPreflightStyles } from 'tailwindcss-scoped-preflight';
+ import { scopedPreflightStyles, isolateInsideOfContainer } from 'tailwindcss-scoped-preflight';

// ...
     scopedPreflightStyles({
-       preflightSelector: '.twp',
-       disableCorePreflight: true,
+       isolationStrategy: isolateInsideOfContainer('.twp'),
      }),
```
