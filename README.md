# Tailwind CSS + UI libraries = no conflicts 🚀

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
- 💨 flexibly remove any preflight styles;
- 🔎 or even [modify particular values](#modifying-the-preflight-styles) of the Tailwind preflight styles (if you have some very specific conflicts).

For ease of use, there are 3 pre-bundled isolation strategies available (as named exports) that cover 99% cases:

- `isolateInsideOfContainer` - everything is protected from the preflight styles, except specified Tailwind root(s).
  Use it when you have all the tailwind-powered stuff **isolated under some root container**.
- `isolateOutsideOfContainer` - protects specific root(s) from the preflight styles - Tailwind is everywhere outside.
  Use it when you have Tailwind powered stuff everywhere as usual, but you want to **exclude some part of the DOM** from being affected by the preflight styles.
- `isolateForComponents` - everything is protected from the preflight styles, except components marked with the selector of your choice.
  Use it when you want the preflight styles to be applied only to particular elements **immediately** (without extra roots or wrappers).
  Good for components - just specify some unique css class for all your components and use them anywhere.

🔨 If none of these strategies work for your case, or something isn't perfect - you can [create your own strategy](#your-owncustom-isolation-strategy).

# Quick Start

### 1. Install

```bash
npm i tailwindcss-scoped-preflight
```

### 2. Update your Tailwind CSS configuration

#### 

```javascript
// tailwind.config.js

import {
  scopedPreflightStyles,
  isolateInsideOfContainer, // there are also isolateOutsideOfContainer and isolateForComponents
} from 'tailwindcss-scoped-preflight';

/** @type {import("tailwindcss").Config} */
const config = {
  // ...
  plugins: [
    // ...
    scopedPreflightStyles({
      isolationStrategy: isolateInsideOfContainer('.twp'),
    }),
  ],
};

exports.default = config;
```

### 3. Use your selector

```tsx
export function MyApp({children}: PropsWithChildren) {
  return (
    <div className={'twp'}>
      {children}
    </div>
  );
}
```

## Component strategy example

Sometimes you might want only specific components to be styled (nothing else) to put them together with some other UI library components (and to have them completely unaffected).
In this case `isolateForComponents` strategy might be what you need.

```javascript
// tailwind.config.js

import {
  scopedPreflightStyles,
  isolateForComponents, 
} from 'tailwindcss-scoped-preflight';

/** @type {import("tailwindcss").Config} */
const config = {
  // ...
  plugins: [
    // ...
    scopedPreflightStyles({
      isolationStrategy: isolateForComponents('.comp'),
    }),
  ],
};

exports.default = config;
```

```tsx
// MyTailwindButton.tsx

import { type PropsWithChildren } from 'react';

export function MyTailwindButton({ children }: PropsWithChildren): ReactElement {
  return (
    <button className={'comp'}>
      {/* this button won't have a default border and background
      because of Tailwind CSS preflight styles applied to the elements
      with the .comp class immediately (as per the configuration).
      All the other buttons around will have their original/default styles */}
      {children}
    </button>
  );
}
```

# Configuration examples

### Using the strategy for multiple selectors

```diff
scopedPreflightStyles({
  isolationStrategy: isolateForComponents(
-   '.comp',
+   [
+     '.comp',
+     '.twp',
+   ],
  ),
})
```

> Although all the strategies allow you to specify a number of selectors - it's recommended to use one short selector to avoid CSS bloat as selectors repeat many times in the generated CSS.


### Keeping some preflight styles unaffected

```diff
scopedPreflightStyles({
  isolationStrategy: isolateForComponents(
    '.comp',
    // every strategy provides the same options to fine tune the transformation
+   {
+     ignore: ["html", ":host", "*"],
+   },
  ),
})
```

### Removing some preflight styles by CSS selector

```diff
scopedPreflightStyles({
  isolationStrategy: isolateForComponents(
    '.comp',
+   {
+     remove: ["body", ":before", ":after"],
+   },
  ),
})
```

### Your own/custom isolation strategy

`isolationStrategy` option is basically a function that accepts the original CSS selector and returns the transformed one.

```javascript
// tailwind.config.js

import { scopedPreflightStyles } from 'tailwindcss-scoped-preflight';

/** @type {import("tailwindcss").Config} */
const config = {
  // ...
  plugins: [
    // ...
    scopedPreflightStyles({
      isolationStrategy: ({ ruleSelector, ...rest }) => {
        // some selector transformation for html, :host and body rules
        if (
          [
            'html',
            ':host',
            'body',
          ].includes(ruleSelector)
        ) {
          return `${ruleSelector} .twp`;
        }

        // returning an empty string or anything falsy removes the CSS rule
        if (ruleSelector === '*') {
          return '';
        }

        // and by default - transform it as per components strategy (just for example)
        return isolateForComponents('.twp')({ ruleSelector, ...rest });
        // Caution! Don't forget to return the value - falsy result will remove the rule
      },
    }),
  ],
};

exports.default = config;
```

### Modifying the preflight styles

This option allows you to hook into the preflight styles to perform some modifications
like removing or changing CSS properties.

You may configure the modifications in a declarative manner (as an object) or provide a function to have more control.

#### Object syntax

```javascript
scopedPreflightStyles({
  isolationStrategy: isolateForComponents('.comp'), // whatever
  modifyPreflightStyles: {
    html: {
      // removes the line-height for the html selector
      'line-height': null,
      // changes the font-family
      'font-family': '"Open Sans", sans-serif',
    },
    body: {
      // replaces the margin value for the body selector in preflight styles
      margin: '0 4px',
      // following won't have any effect as this property is not in the preflight styles
      color: 'red',
    },
  },
})
```

#### Function syntax

```javascript
scopedPreflightStyles({
  isolationStrategy: isolateForComponents('.comp'), // whatever
  modifyPreflightStyles: ({selectorSet, property, value}) => {
    // let's say you want to override the font family (no matter what the rule selector is)
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
})
```

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
