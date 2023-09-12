### What

TailwindCSS plugin

### Why

To avoid style conflicts (CSS collisions/interference side effects) when using Tailwind CSS with other UI libraries like Antd, Vuetify etc.

### How

This plugin is limiting the scope of [Tailwind's opinionated preflight styles](https://tailwindcss.com/docs/preflight) to the customizable CSS selector.
So you can control where exactly in DOM to apply these base styles - usually it's your own components (not the 3rd party).

## Installation

```bash
npm i tailwindcss-scoped-preflight
```

## Usage

#### Update your TailwindCSS configuration

```javascript 
// # tailwind.config.js

const { scopedPreflightStyles } = require('tailwindcss-scoped-preflight');

/** @type {import("tailwindcss").Config} */
const config = {
    // ... your TailwindCSS config
    corePlugins: {
        preflight: false, // or use the disableCorePreflight option below
    },
    plugins: [
        // ... other plugins
        scopedPreflightStyles({
            preflightSelector: '.twp', // or .tailwind-preflight or even [data-twp=true] - any valid CSS selector of your choice
            disableCorePreflight: true, // or disable it with corePlugins option as shown above
        }),
    ],
};

exports.default = config;
```

> Please note that long preflightSelector will generate more CSS boilerplate - so it's recommended to keep it short

#### Apply the styles wherever you want them to be 
    
* To isolate the opinionated styles within the component

```tsx
// # MyTailwindButton.tsx

import { type PropsWithChildren } from 'react';
    
export function MyTailwindButton({ children }: PropsWithChildren): ReactElement {
  return (
    <button className={'twp'}> // this button will have no default border and background because of TailwindCSS
      preflight styles
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
    <div className={'twp'}> // all the children will have default TailwindCSS styles applied, but not components outside of this wrapper
      { children }
    </div>
  );
}
```
