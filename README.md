### What

Tailwind CSS plugin

### Why

To avoid style conflicts (CSS collisions/interference side effects) when using Tailwind CSS with other UI libraries like Antd, Vuetify etc.

### How

This plugin is limiting the scope of [Tailwind's opinionated preflight styles](https://tailwindcss.com/docs/preflight) to the customizable CSS selector.
So you can control where exactly in DOM to apply these base styles - usually it's your own components (not the 3rd party).

There are 2 modes available:
* `matched only` (default) - only matched selectors will be styled with Tailwind CSS base styles
* `except matched` - everything will be styled with Tailwind CSS as usual, except matched selectors children

## Installation

```bash
npm i tailwindcss-scoped-preflight
```

## Use case 1 - matched only
Apply Tailwind base styles explicitly **to particular selectors only**

#### Update your Tailwind CSS configuration

```javascript 
// # tailwind.config.js

const { scopedPreflightStyles } = require('tailwindcss-scoped-preflight');

/** @type {import("tailwindcss").Config} */
const config = {
    // ... your Tailwind CSS config
    plugins: [
        // ... other plugins
        scopedPreflightStyles({
            cssSelector: '.twp', // or .tailwind-preflight or even [data-twp=true] - any valid CSS selector of your choice
            mode: 'matched only', // it's the default
        }),
    ],
};

exports.default = config;
```

#### Apply the base Tailwind styles explicitly wherever you want them to be
    
* To isolate Tailwind base styles within the component

```tsx
// # MyTailwindButton.tsx

import {type PropsWithChildren} from 'react';

export function MyTailwindButton({children}: PropsWithChildren): ReactElement {
  return (
    <button className={'twp'}> 
      // this button will have no default border and background
      // because of Tailwind CSS preflight styles
      {children}
    </button>
  );
}
```

* Or make a wrapper to style all its children

```tsx
// # TailwindPreflightStyles

import { type PropsWithChildren } from 'react';

export function TailwindPreflightStyles({ children }: PropsWithChildren): ReactElement {
  return (
    <div className={'twp'}> // when mode is 'matched only' - all the children will have default Tailwind CSS styles applied, but not components outside of this wrapper
      { children }
    </div>
  );
}
```


## Use case 2 - except matched
If you want tailwind base styles to be applied everywhere (as usual) except selected elements

#### Update your Tailwind CSS configuration

```javascript 
// # tailwind.config.js

const { scopedPreflightStyles } = require('tailwindcss-scoped-preflight');

/** @type {import("tailwindcss").Config} */
const config = {
    // ... your Tailwind CSS config
    plugins: [
        // ... other plugins
        scopedPreflightStyles({
            cssSelector: '.notw', // or .notailwind or even [data-tailwind=false] - any valid CSS selector of your choice
            mode: 'except matched',
        }),
    ],
};

exports.default = config;
```

#### Apply the selector to conflicting components only 

```tsx
// # MyButton.tsx

import { type PropsWithChildren } from 'react';
    
export function MyButton({ children }: PropsWithChildren): ReactElement {
  return (
    <span> className={'notw'}>
      <button>
        {children}
      </button>
    </span>
  );
}
```

* Or make a wrapper disable base styles for all its children

```tsx
// # DisableTailwindBaseStyles.tsx

import { type PropsWithChildren } from 'react';

export function DisableTailwindBaseStyles({ children }: PropsWithChildren): ReactElement {
  return (
    <div className={'notw'}>
      { children }
    </div>
  );
}
```

> Please note that long `cssSelector` will generate larger CSS boilerplate - so it's recommended to keep it short
